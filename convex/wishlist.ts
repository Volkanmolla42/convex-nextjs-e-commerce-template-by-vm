import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { resolveVariantImageUrl } from "./productImages";
import { getRequiredUserId } from "./helpers";

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const wishlistItems = await ctx.db
      .query("wishlists")
      .withIndex("userId", (queryBuilder) => queryBuilder.eq("userId", userId))
      .collect();

    const sorted = wishlistItems.sort((a, b) => b.createdAt - a.createdAt);

    const result = await Promise.all(
      sorted.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product || !product.isActive) {
          return null;
        }

        const variants = await ctx.db
          .query("productVariants")
          .withIndex("productId_isActive", (queryBuilder) =>
            queryBuilder.eq("productId", product._id).eq("isActive", true),
          )
          .collect();

        if (variants.length === 0) {
          return null;
        }

        const price = Math.min(...variants.map((variant) => variant.price));
        const stock = variants.reduce((total, variant) => total + variant.stock, 0);
        const defaultVariant = variants[0];

        return {
          wishlistId: item._id,
          productId: product._id,
          productName: product.name,
          productSlug: product.slug,
          price,
          stock,
          image: await resolveVariantImageUrl(ctx, defaultVariant),
          createdAt: item.createdAt,
        };
      }),
    );

    return result.filter((item) => item !== null);
  },
});

export const toggle = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const userId = await getRequiredUserId(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product || !product.isActive) {
      throw new Error("Urun bulunamadi");
    }

    const existing = await ctx.db
      .query("wishlists")
      .withIndex("userId_productId", (queryBuilder) =>
        queryBuilder.eq("userId", userId).eq("productId", args.productId),
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { added: false };
    }

    await ctx.db.insert("wishlists", {
      userId,
      productId: args.productId,
      createdAt: Date.now(),
    });

    return { added: true };
  },
});

export const isInWishlist = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const existing = await ctx.db
      .query("wishlists")
      .withIndex("userId_productId", (queryBuilder) =>
        queryBuilder.eq("userId", userId).eq("productId", args.productId),
      )
      .first();

    return !!existing;
  },
});
