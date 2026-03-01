import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { resolveProductImageUrl } from "./productImages";

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

async function findActiveCart(
  ctx: AnyCtx,
  owner: CartOwner,
) {
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

async function ensureActiveCart(
  ctx: MutationCtx,
  owner: CartOwner,
) {
  const existing = await findActiveCart(ctx, owner);
  if (existing) {
    return existing;
  }

  const now = Date.now();
  const cartId = await ctx.db.insert("carts", {
    userId: owner.userId,
    guestSessionId: owner.guestSessionId,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });

  return await ctx.db.get(cartId);
}

async function buildCartResponse(
  ctx: AnyCtx,
  cart: Doc<"carts"> | null,
) {
  type ResponseItem = {
    productId: Id<"products">;
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
      totalItems: 0,
    };
  }

  const cartItems = await ctx.db
    .query("cartItems")
    .withIndex("cartId", (queryBuilder) => queryBuilder.eq("cartId", cart._id))
    .collect();

  const products = await Promise.all(
    cartItems.map((item) => ctx.db.get(item.productId)),
  );

  const itemResults = await Promise.all(
    cartItems.map(async (item, index) => {
      const product = products[index];
      if (!product || !product.isActive) {
        return null;
      }

      return {
        productId: item.productId,
        name: product.name,
        image: await resolveProductImageUrl(ctx, product),
        price: product.price,
        quantity: item.quantity,
        stock: product.stock,
      };
    }),
  );

  const items = itemResults.filter((item): item is ResponseItem => item !== null);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return {
    cartId: cart._id,
    items,
    subtotal,
    totalItems,
  };
}

export const getActive = query({
  args: {
    guestSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const owner = await resolveOwner(ctx, args.guestSessionId);
    if (!owner) {
      return {
        cartId: null,
        items: [],
        subtotal: 0,
        totalItems: 0,
      };
    }

    const cart = await findActiveCart(ctx, owner);
    return await buildCartResponse(ctx, cart);
  },
});

export const addItem = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.optional(v.number()),
    guestSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const owner = await resolveOwner(ctx, args.guestSessionId);
    if (!owner) {
      throw new Error("Sepet sahibi bulunamadi");
    }

    const quantity = args.quantity ?? 1;
    if (quantity <= 0) {
      throw new Error("Gecerli miktar gerekli");
    }

    const product = await ctx.db.get(args.productId);
    if (!product || !product.isActive) {
      throw new Error("Urun bulunamadi");
    }

    const cart = await ensureActiveCart(ctx, owner);
    if (!cart) {
      throw new Error("Sepet olusturulamadi");
    }

    const existingItem = (
      await ctx.db
        .query("cartItems")
        .withIndex("cartId", (queryBuilder) => queryBuilder.eq("cartId", cart._id))
        .collect()
    ).find((item) => item.productId === args.productId);

    const now = Date.now();
    if (existingItem) {
      const nextQuantity = existingItem.quantity + quantity;
      if (nextQuantity > product.stock) {
        throw new Error("Yetersiz stok");
      }

      await ctx.db.patch(existingItem._id, {
        quantity: nextQuantity,
        updatedAt: now,
      });
    } else {
      if (quantity > product.stock) {
        throw new Error("Yetersiz stok");
      }

      await ctx.db.insert("cartItems", {
        cartId: cart._id,
        productId: args.productId,
        quantity,
        createdAt: now,
        updatedAt: now,
      });
    }

    await ctx.db.patch(cart._id, { updatedAt: now });
  },
});

export const updateItemQuantity = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    guestSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.quantity <= 0) {
      throw new Error("Miktar 1 veya daha buyuk olmali");
    }

    const owner = await resolveOwner(ctx, args.guestSessionId);
    if (!owner) {
      throw new Error("Sepet sahibi bulunamadi");
    }

    const cart = await findActiveCart(ctx, owner);
    if (!cart) {
      throw new Error("Sepet bulunamadi");
    }

    const product = await ctx.db.get(args.productId);
    if (!product || !product.isActive) {
      throw new Error("Urun bulunamadi");
    }

    if (args.quantity > product.stock) {
      throw new Error("Yetersiz stok");
    }

    const item = (
      await ctx.db
        .query("cartItems")
        .withIndex("cartId", (queryBuilder) => queryBuilder.eq("cartId", cart._id))
        .collect()
    ).find((cartItem) => cartItem.productId === args.productId);

    if (!item) {
      throw new Error("Sepet urunu bulunamadi");
    }

    const now = Date.now();
    await ctx.db.patch(item._id, {
      quantity: args.quantity,
      updatedAt: now,
    });
    await ctx.db.patch(cart._id, { updatedAt: now });
  },
});

export const removeItem = mutation({
  args: {
    productId: v.id("products"),
    guestSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const owner = await resolveOwner(ctx, args.guestSessionId);
    if (!owner) {
      throw new Error("Sepet sahibi bulunamadi");
    }

    const cart = await findActiveCart(ctx, owner);
    if (!cart) {
      return;
    }

    const item = (
      await ctx.db
        .query("cartItems")
        .withIndex("cartId", (queryBuilder) => queryBuilder.eq("cartId", cart._id))
        .collect()
    ).find((cartItem) => cartItem.productId === args.productId);

    if (!item) {
      return;
    }

    await ctx.db.delete(item._id);
    await ctx.db.patch(cart._id, { updatedAt: Date.now() });
  },
});

export const clear = mutation({
  args: {
    guestSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const owner = await resolveOwner(ctx, args.guestSessionId);
    if (!owner) {
      throw new Error("Sepet sahibi bulunamadi");
    }

    const cart = await findActiveCart(ctx, owner);
    if (!cart) {
      return;
    }

    const items = await ctx.db
      .query("cartItems")
      .withIndex("cartId", (queryBuilder) => queryBuilder.eq("cartId", cart._id))
      .collect();

    await Promise.all(items.map((item) => ctx.db.delete(item._id)));
    await ctx.db.patch(cart._id, { updatedAt: Date.now() });
  },
});
