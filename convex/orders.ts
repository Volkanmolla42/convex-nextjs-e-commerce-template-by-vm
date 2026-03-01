import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { assertAdmin } from "./permissions";
import { resolveProductImageUrl } from "./productImages";

const SHIPPING_FEE = 50;
const FREE_SHIPPING_THRESHOLD = 5000;
const ORDER_CURRENCY = "TRY";

type CartOwner =
  | { userId: Id<"users">; guestSessionId?: undefined }
  | { userId?: undefined; guestSessionId: string };

type AnyCtx = QueryCtx | MutationCtx;

async function resolveOwner(
  ctx: AnyCtx,
  guestSessionId: string | undefined,
): Promise<CartOwner | null> {
  const userId = await getAuthUserId(ctx);
  if (userId) {
    return { userId };
  }

  if (guestSessionId && guestSessionId.trim()) {
    return { guestSessionId: guestSessionId.trim() };
  }

  return null;
}

async function findActiveCart(ctx: AnyCtx, owner: CartOwner) {
  if (owner.userId) {
    return await ctx.db
      .query("carts")
      .withIndex("userId_status", (queryBuilder) =>
        queryBuilder.eq("userId", owner.userId).eq("status", "active"),
      )
      .first();
  }

  return await ctx.db
    .query("carts")
    .withIndex("guestSessionId_status", (queryBuilder) =>
      queryBuilder.eq("guestSessionId", owner.guestSessionId).eq("status", "active"),
    )
    .first();
}

export const createFromActiveCart = mutation({
  args: {
    guestSessionId: v.optional(v.string()),
    customerName: v.string(),
    customerPhone: v.string(),
    customerCity: v.string(),
    customerProvince: v.string(),
    customerAddress: v.string(),
    customerApartment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const owner = await resolveOwner(ctx, args.guestSessionId);
    if (!owner) {
      throw new Error("Sepet sahibi bulunamadi");
    }

    const cart = await findActiveCart(ctx, owner);
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

    const products = await Promise.all(
      cartItems.map((item) => ctx.db.get(item.productId)),
    );

    let subtotal = 0;
    for (let index = 0; index < cartItems.length; index += 1) {
      const product = products[index];
      const item = cartItems[index];
      if (!product || !product.isActive) {
        throw new Error("Sepette gecersiz urun var");
      }

      if (item.quantity > product.stock) {
        throw new Error("Stok yetersiz");
      }

      subtotal += product.price * item.quantity;
    }

    const shippingFee =
      subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal + shippingFee;
    const now = Date.now();

    const orderId = await ctx.db.insert("orders", {
      userId: owner.userId,
      guestSessionId: owner.guestSessionId,
      cartId: cart._id,
      status: "pending",
      subtotal,
      shippingFee,
      total,
      currency: ORDER_CURRENCY,
      customerName: args.customerName.trim(),
      customerPhone: args.customerPhone.trim(),
      customerCity: args.customerCity.trim(),
      customerProvince: args.customerProvince.trim(),
      customerAddress: args.customerAddress.trim(),
      customerApartment: args.customerApartment?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    });

    for (let index = 0; index < cartItems.length; index += 1) {
      const item = cartItems[index];
      const product = products[index];
      if (!product) {
        continue;
      }

      await ctx.db.insert("orderItems", {
        orderId,
        productId: product._id,
        productName: product.name,
        productPrice: product.price,
        productImage: await resolveProductImageUrl(ctx, product),
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
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);

    const orders = await ctx.db.query("orders").collect();
    const sorted = orders.sort((a, b) => b.createdAt - a.createdAt);

    return await Promise.all(
      sorted.map(async (order) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("orderId", (queryBuilder) => queryBuilder.eq("orderId", order._id))
          .collect();

        const user = order.userId ? await ctx.db.get(order.userId) : null;
        return {
          ...order,
          userEmail: user?.email ?? "",
          items,
        };
      }),
    );
  },
});
