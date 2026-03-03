import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertAdmin } from "./permissions";
import {
  calculateDiscount,
  calculateNetTotal,
  calculateShippingFee,
} from "./pricing";
import { resolveVariantImageUrl } from "./productImages";
import { getRequiredUserId, getVariantLabel, findActiveCartByUserId } from "./helpers";
import { paginationOptsValidator } from "convex/server";

const ORDER_CURRENCY = "TRY";

function generateOrderNo() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SP-${timestamp}-${random}`;
}

export const createFromActiveCart = mutation({
  args: {
    customerName: v.string(),
    customerPhone: v.string(),
    customerCity: v.string(),
    customerProvince: v.string(),
    customerAddress: v.string(),
    customerApartment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getRequiredUserId(ctx);
    const cart = await findActiveCartByUserId(ctx, userId);

    if (!cart) {
      throw new Error("Aktif sepet bulunamadi");
    }

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("cartId", (queryBuilder) => queryBuilder.eq("cartId", cart._id))
      .collect();

    if (cartItems.length === 0) {
      throw new Error("Sepet bos");
    }

    const [products, variants] = await Promise.all([
      Promise.all(cartItems.map((item) => ctx.db.get(item.productId))),
      Promise.all(cartItems.map((item) => ctx.db.get(item.variantId))),
    ]);

    let subtotal = 0;
    for (let index = 0; index < cartItems.length; index += 1) {
      const product = products[index];
      const variant = variants[index];
      const item = cartItems[index];

      if (!product || !product.isActive) {
        throw new Error("Sepette gecersiz urun var");
      }

      if (!variant || !variant.isActive || variant.productId !== product._id) {
        throw new Error("Sepette gecersiz varyant var");
      }
      if (item.quantity > variant.stock) {
        throw new Error("Stok yetersiz");
      }

      subtotal += item.unitPriceSnapshot * item.quantity;
    }

    const discount = calculateDiscount(subtotal);
    const shippingFee = calculateShippingFee(subtotal);
    const total = calculateNetTotal(subtotal, discount) + shippingFee;
    const now = Date.now();

    const orderId = await ctx.db.insert("orders", {
      userId,
      orderNo: generateOrderNo(),
      cartId: cart._id,
      status: "pending",
      subtotal,
      discount,
      shippingFee,
      total,
      currency: ORDER_CURRENCY,
      customerName: args.customerName.trim(),
      customerPhone: args.customerPhone.trim(),
      customerCity: args.customerCity.trim(),
      customerProvince: args.customerProvince.trim(),
      customerAddress: args.customerAddress.trim(),
      customerApartment: args.customerApartment?.trim() || undefined,
      addressSnapshot: {
        city: args.customerCity.trim(),
        district: args.customerProvince.trim(),
        detail: args.customerAddress.trim(),
        apartment: args.customerApartment?.trim() || undefined,
      },
      createdAt: now,
      updatedAt: now,
    });

    for (let index = 0; index < cartItems.length; index += 1) {
      const item = cartItems[index];
      const product = products[index];
      const variant = variants[index];
      if (!product || !variant) {
        continue;
      }

      await ctx.db.insert("orderItems", {
        orderId,
        productId: product._id,
        variantId: variant._id,
        name: `${product.name} (${getVariantLabel(variant.attributes, variant.sku)})`,
        productName: product.name,
        sku: variant.sku,
        unitPriceSnapshot: item.unitPriceSnapshot,
        productPrice: item.unitPriceSnapshot,
        productImage: await resolveVariantImageUrl(ctx, variant),
        quantity: item.quantity,
        createdAt: now,
      });
    }

    await ctx.db.patch(cart._id, {
      status: "completed",
      updatedAt: now,
    });

    return { orderId };
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const orders = await ctx.db
      .query("orders")
      .withIndex("userId", (queryBuilder) => queryBuilder.eq("userId", userId))
      .collect();

    const sorted = orders.sort((a, b) => b.createdAt - a.createdAt);

    return await Promise.all(
      sorted.map(async (order) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("orderId", (queryBuilder) => queryBuilder.eq("orderId", order._id))
          .collect();
        return { ...order, items };
      }),
    );
  },
});

export const listAdmin = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const result = await ctx.db
      .query("orders")
      .order("desc")
      .paginate(args.paginationOpts);

    const ordersWithDetails = await Promise.all(
      result.page.map(async (order) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("orderId", (q) => q.eq("orderId", order._id))
          .collect();

        const user = await ctx.db.get(order.userId);
        return {
          ...order,
          userEmail: user?.email ?? "",
          items,
        };
      }),
    );

    return {
      ...result,
      page: ordersWithDetails,
    };
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("shipped"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Siparis bulunamadi");
    }

    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getById = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const userId = await getRequiredUserId(ctx);

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Siparis bulunamadi");
    }

    if (order.userId !== userId) {
      throw new Error("Yetkisiz");
    }

    const items = await ctx.db
      .query("orderItems")
      .withIndex("orderId", (q) => q.eq("orderId", order._id))
      .collect();

    return { ...order, items };
  },
});
