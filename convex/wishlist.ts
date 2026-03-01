import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listMine = query({
  args: {},
  handler: async () => {
    return [];
  },
});

export const toggle = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async () => {
    throw new Error("Favori modulu henuz aktif degil");
  },
});
