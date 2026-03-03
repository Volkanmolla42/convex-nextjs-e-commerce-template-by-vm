import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import {
  calculateDiscount,
  calculateNetTotal,
  calculatePayableTotal,
  calculateShippingFee,
} from "./pricing";
import { resolveVariantImageUrl } from "./productImages";
import { getRequiredUserId, getVariantLabel, findActiveCartByUserId } from "./helpers";

type AnyCtx = QueryCtx | MutationCtx;

async function ensureActiveCart(ctx: MutationCtx, userId: Id<"users">) {
  const existing = await findActiveCartByUserId(ctx, userId);
  if (existing) {
    return existing;
  }

  const now = Date.now();
  const cartId = await ctx.db.insert("carts", {
    userId,
    status: "active",
    subtotal: 0,
    discount: 0,
    total: 0,
    createdAt: now,
    updatedAt: now,
  });

  return await ctx.db.get(cartId);
}

async function resolveVariantForProduct(
  ctx: MutationCtx,
  productId: Id<"products">,
  variantId?: Id<"productVariants">,
) {
  if (variantId) {
    const variant = await ctx.db.get(variantId);
    if (!variant || variant.productId !== productId || !variant.isActive) {
      throw new Error("Gecerli urun varyanti bulunamadi");
    }
    return variant;
  }

  const defaultVariant = await ctx.db
    .query("productVariants")
    .withIndex("productId_isActive", (queryBuilder) =>
      queryBuilder.eq("productId", productId).eq("isActive", true),
    )
    .first();

  if (!defaultVariant) {
    throw new Error("Aktif varyant bulunamadi");
  }

  return defaultVariant;
}

async function recalculateCartTotals(ctx: MutationCtx, cartId: Id<"carts">) {
  const items = await ctx.db
    .query("cartItems")
    .withIndex("cartId", (queryBuilder) => queryBuilder.eq("cartId", cartId))
    .collect();

  const subtotal = items.reduce(
    (accumulator, item) => accumulator + item.unitPriceSnapshot * item.quantity,
    0,
  );
  const discount = calculateDiscount(subtotal);
  const total = calculateNetTotal(subtotal, discount);

  await ctx.db.patch(cartId, {
    subtotal,
    discount,
    total,
    updatedAt: Date.now(),
  });
}

async function buildCartResponse(ctx: AnyCtx, cart: Doc<"carts"> | null) {
  type ResponseItem = {
    cartItemId: Id<"cartItems">;
    productId: Id<"products">;
    variantId: Id<"productVariants">;
    sku: string;
    variantLabel: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    stock: number;
  };

  if (!cart) {
    return {
      cartId: null,
      items: [] as ResponseItem[],
      subtotal: 0,
      discount: 0,
      shippingFee: 0,
      total: 0,
      payableTotal: 0,
      totalItems: 0,
    };
  }

  const cartItems = await ctx.db
    .query("cartItems")
    .withIndex("cartId", (queryBuilder) => queryBuilder.eq("cartId", cart._id))
    .collect();

  const [products, variants] = await Promise.all([
    Promise.all(cartItems.map((item) => ctx.db.get(item.productId))),
    Promise.all(cartItems.map((item) => ctx.db.get(item.variantId))),
  ]);

  const itemResults = await Promise.all(
    cartItems.map(async (item, index) => {
      const product = products[index];
      const variant = variants[index];

      if (!product || !product.isActive || !variant || !variant.isActive || variant.productId !== product._id) {
        return null;
      }

      return {
        cartItemId: item._id,
        productId: item.productId,
        variantId: variant._id,
        sku: variant.sku,
        variantLabel: getVariantLabel(variant.attributes, variant.sku),
        name: product.name,
        image: await resolveVariantImageUrl(ctx, variant),
        price: item.unitPriceSnapshot,
        quantity: item.quantity,
        stock: variant.stock,
      };
    }),
  );

  const items: ResponseItem[] = [];
  for (const item of itemResults) {
    if (item) {
      items.push(item);
    }
  }

  const subtotal = items.reduce((accumulator, item) => accumulator + item.price * item.quantity, 0);
  const discount = calculateDiscount(subtotal);
  const shippingFee = calculateShippingFee(subtotal);
  const total = calculateNetTotal(subtotal, discount);
  const payableTotal = calculatePayableTotal(subtotal, discount);
  const totalItems = items.reduce((accumulator, item) => accumulator + item.quantity, 0);

  return {
    cartId: cart._id,
    items,
    subtotal,
    discount,
    shippingFee,
    total,
    payableTotal,
    totalItems,
  };
}

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        cartId: null,
        items: [],
        subtotal: 0,
        discount: 0,
        shippingFee: 0,
        total: 0,
        payableTotal: 0,
        totalItems: 0,
      };
    }

    const cart = await findActiveCartByUserId(ctx, userId);
    return await buildCartResponse(ctx, cart);
  },
});

export const addItem = mutation({
  args: {
    productId: v.id("products"),
    variantId: v.optional(v.id("productVariants")),
    quantity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getRequiredUserId(ctx);
    const quantity = args.quantity ?? 1;

    if (quantity <= 0) {
      throw new Error("Gecerli miktar gerekli");
    }

    const product = await ctx.db.get(args.productId);
    if (!product || !product.isActive) {
      throw new Error("Urun bulunamadi");
    }

    const selectedVariant = await resolveVariantForProduct(
      ctx,
      args.productId,
      args.variantId,
    );
    const availableStock = selectedVariant.stock;
    const unitPrice = selectedVariant.price;

    const cart = await ensureActiveCart(ctx, userId);
    if (!cart) {
      throw new Error("Sepet olusturulamadi");
    }

    const existingItem = (
      await ctx.db
        .query("cartItems")
        .withIndex("cartId_variantId", (queryBuilder) =>
          queryBuilder.eq("cartId", cart._id).eq("variantId", selectedVariant._id),
        )
        .collect()
    )[0];

    const now = Date.now();
    if (existingItem) {
      const nextQuantity = existingItem.quantity + quantity;
      if (nextQuantity > availableStock) {
        throw new Error("Yetersiz stok");
      }

      await ctx.db.patch(existingItem._id, {
        quantity: nextQuantity,
        unitPriceSnapshot: unitPrice,
        updatedAt: now,
      });
    } else {
      if (quantity > availableStock) {
        throw new Error("Yetersiz stok");
      }

      await ctx.db.insert("cartItems", {
        cartId: cart._id,
        productId: args.productId,
        variantId: selectedVariant._id,
        quantity,
        unitPriceSnapshot: unitPrice,
        createdAt: now,
        updatedAt: now,
      });
    }

    await recalculateCartTotals(ctx, cart._id);
  },
});

export const updateItemQuantity = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getRequiredUserId(ctx);

    if (args.quantity <= 0) {
      throw new Error("Miktar 1 veya daha buyuk olmali");
    }

    const cart = await findActiveCartByUserId(ctx, userId);
    if (!cart) {
      throw new Error("Sepet bulunamadi");
    }

    const item = await ctx.db.get(args.cartItemId);
    if (!item || item.cartId !== cart._id) {
      throw new Error("Sepet urunu bulunamadi");
    }

    const product = await ctx.db.get(item.productId);
    if (!product || !product.isActive) {
      throw new Error("Urun bulunamadi");
    }

    const variant = await ctx.db.get(item.variantId);
    if (!variant || !variant.isActive || variant.productId !== item.productId) {
      throw new Error("Urun varyanti bulunamadi");
    }

    if (args.quantity > variant.stock) {
      throw new Error("Yetersiz stok");
    }

    await ctx.db.patch(item._id, {
      quantity: args.quantity,
      unitPriceSnapshot: variant.price,
      updatedAt: Date.now(),
    });
    await recalculateCartTotals(ctx, cart._id);
  },
});

export const removeItem = mutation({
  args: {
    cartItemId: v.id("cartItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getRequiredUserId(ctx);
    const cart = await findActiveCartByUserId(ctx, userId);

    if (!cart) {
      return;
    }

    const item = await ctx.db.get(args.cartItemId);
    if (!item || item.cartId !== cart._id) {
      return;
    }

    await ctx.db.delete(item._id);
    await recalculateCartTotals(ctx, cart._id);
  },
});

export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getRequiredUserId(ctx);
    const cart = await findActiveCartByUserId(ctx, userId);

    if (!cart) {
      return;
    }

    const items = await ctx.db
      .query("cartItems")
      .withIndex("cartId", (queryBuilder) => queryBuilder.eq("cartId", cart._id))
      .collect();

    await Promise.all(items.map((item) => ctx.db.delete(item._id)));
    await recalculateCartTotals(ctx, cart._id);
  },
});
