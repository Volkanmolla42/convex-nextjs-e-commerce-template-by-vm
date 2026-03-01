import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByProduct = query({
  args: {
    productId: v.id("products"),
  },
  handler: async () => {
    return [];
  },
});

export const create = mutation({
  args: {
    productId: v.id("products"),
    rating: v.number(),
    content: v.string(),
  },
  handler: async () => {
    throw new Error("Yorum modulu henuz aktif degil");
  },
});
