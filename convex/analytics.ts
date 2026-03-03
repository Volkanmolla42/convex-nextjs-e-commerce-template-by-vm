import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const trackProductView = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const now = Date.now();

    await ctx.db.insert("productViews", {
      productId: args.productId,
      userId: userId ?? undefined,
      viewedAt: now,
    });

    return { success: true };
  },
});

export const trackAddToCart = mutation({
  args: {
    productId: v.id("products"),
    variantId: v.id("productVariants"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const now = Date.now();

    await ctx.db.insert("cartEvents", {
      productId: args.productId,
      variantId: args.variantId,
      quantity: args.quantity,
      userId: userId ?? undefined,
      eventType: "add",
      createdAt: now,
    });

    return { success: true };
  },
});

export const getProductViewCount = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const views = await ctx.db
      .query("productViews")
      .withIndex("productId", (q) => q.eq("productId", args.productId))
      .collect();

    return views.length;
  },
});

export const cleanupOldAnalytics = internalMutation({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const oldViews = await ctx.db
      .query("productViews")
      .withIndex("viewedAt", (q) => q.lt("viewedAt", thirtyDaysAgo))
      .collect();

    await Promise.all(oldViews.map((view) => ctx.db.delete(view._id)));

    const oldEvents = await ctx.db
      .query("cartEvents")
      .withIndex("createdAt", (q) => q.lt("createdAt", thirtyDaysAgo))
      .collect();

    await Promise.all(oldEvents.map((event) => ctx.db.delete(event._id)));

    return {
      deletedViews: oldViews.length,
      deletedEvents: oldEvents.length,
    };
  },
});
