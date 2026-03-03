import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { sanitizeText, getRequiredUserId } from "./helpers";
import { assertAdmin } from "./permissions";
import { paginationOptsValidator } from "convex/server";

export const listByProduct = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("productId_status", (queryBuilder) =>
        queryBuilder.eq("productId", args.productId).eq("status", "approved"),
      )
      .collect();

    const sorted = reviews.sort((a, b) => b.createdAt - a.createdAt);

    return await Promise.all(
      sorted.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        return {
          ...review,
          userName: user?.name ?? "Anonim",
        };
      }),
    );
  },
});

export const create = mutation({
  args: {
    productId: v.id("products"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getRequiredUserId(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product || !product.isActive) {
      throw new Error("Urun bulunamadi");
    }

    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Puan 1-5 arasinda olmali");
    }

    const comment = sanitizeText(args.comment);
    if (!comment || comment.length < 10) {
      throw new Error("Yorum en az 10 karakter olmali");
    }

    const existing = await ctx.db
      .query("reviews")
      .withIndex("userId_productId", (queryBuilder) =>
        queryBuilder.eq("userId", userId).eq("productId", args.productId),
      )
      .first();

    if (existing) {
      throw new Error("Bu urun icin zaten yorum yaptiniz");
    }

    const now = Date.now();
    await ctx.db.insert("reviews", {
      productId: args.productId,
      userId,
      rating: args.rating,
      comment,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listPending = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const result = await ctx.db
      .query("reviews")
      .withIndex("status_createdAt", (q) => q.eq("status", "pending"))
      .order("desc")
      .paginate(args.paginationOpts);

    const reviewsWithDetails = await Promise.all(
      result.page.map(async (review) => {
        const [user, product] = await Promise.all([
          ctx.db.get(review.userId),
          ctx.db.get(review.productId),
        ]);

        return {
          ...review,
          userName: user?.name ?? "Anonim",
          productName: product?.name ?? "",
        };
      }),
    );

    return {
      ...result,
      page: reviewsWithDetails,
    };
  },
});

export const updateStatus = mutation({
  args: {
    reviewId: v.id("reviews"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Yorum bulunamadi");
    }

    await ctx.db.patch(args.reviewId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});
