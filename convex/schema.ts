import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }).index("email", ["email"]),
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("slug", ["slug"])
    .index("isActive", ["isActive"])
    .index("sortOrder", ["sortOrder"]),
  products: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    details: v.string(),
    careInstructions: v.string(),
    price: v.number(),
    image: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    categoryId: v.id("categories"),
    stock: v.number(),
    isActive: v.boolean(),
    isFeatured: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("slug", ["slug"])
    .index("categoryId", ["categoryId"])
    .index("isActive", ["isActive"])
    .index("isFeatured", ["isFeatured"]),
  carts: defineTable({
    userId: v.optional(v.id("users")),
    guestSessionId: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("completed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("userId_status", ["userId", "status"])
    .index("guestSessionId_status", ["guestSessionId", "status"]),
  cartItems: defineTable({
    cartId: v.id("carts"),
    productId: v.id("products"),
    quantity: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("cartId", ["cartId"]),
  orders: defineTable({
    userId: v.optional(v.id("users")),
    guestSessionId: v.optional(v.string()),
    cartId: v.optional(v.id("carts")),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("shipped"),
      v.literal("cancelled"),
    ),
    subtotal: v.number(),
    shippingFee: v.number(),
    total: v.number(),
    currency: v.string(),
    customerName: v.string(),
    customerPhone: v.string(),
    customerCity: v.string(),
    customerProvince: v.string(),
    customerAddress: v.string(),
    customerApartment: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("createdAt", ["createdAt"]),
  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.optional(v.id("products")),
    productName: v.string(),
    productPrice: v.number(),
    productImage: v.string(),
    quantity: v.number(),
    createdAt: v.number(),
  }).index("orderId", ["orderId"]),
});
