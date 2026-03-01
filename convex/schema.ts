import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    images: v.array(v.string()),
    categoryId: v.optional(v.id("categories")),
    stock: v.number(),
  }),
  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
  }),
  orders: defineTable({
    userId: v.id("users"),
    totalAmount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        priceAtPurchase: v.number(),
      })
    ),
  }),
});
