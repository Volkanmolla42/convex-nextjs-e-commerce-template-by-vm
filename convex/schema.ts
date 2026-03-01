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
    parentId: v.optional(v.id("categories")),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("slug", ["slug"])
    .index("parentId", ["parentId"])
    .index("parentId_sortOrder", ["parentId", "sortOrder"])
    .index("isActive", ["isActive"])
    .index("sortOrder", ["sortOrder"]),
  products: defineTable({
    name: v.string(),
    slug: v.string(),
    brand: v.optional(v.string()),
    description: v.string(),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    categoryId: v.id("categories"),
    isActive: v.boolean(),
    isFeatured: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("slug", ["slug"])
    .index("categoryId", ["categoryId"])
    .index("categoryId_isActive", ["categoryId", "isActive"])
    .index("createdAt", ["createdAt"])
    .index("isActive", ["isActive"])
    .index("isFeatured", ["isFeatured"]),
  productVariants: defineTable({
    productId: v.id("products"),
    sku: v.string(),
    attributes: v.record(v.string(), v.string()),
    imageStorageId: v.id("_storage"),
    price: v.number(),
    stock: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("productId", ["productId"])
    .index("productId_isActive", ["productId", "isActive"])
    .index("productId_createdAt", ["productId", "createdAt"])
    .index("sku", ["sku"])
    .index("isActive", ["isActive"]),
  carts: defineTable({
    userId: v.id("users"),
    status: v.union(v.literal("active"), v.literal("completed")),
    subtotal: v.number(),
    discount: v.number(),
    total: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("createdAt", ["createdAt"])
    .index("userId_createdAt", ["userId", "createdAt"])
    .index("userId_status", ["userId", "status"]),
  cartItems: defineTable({
    cartId: v.id("carts"),
    productId: v.id("products"),
    variantId: v.id("productVariants"),
    quantity: v.number(),
    unitPriceSnapshot: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("cartId", ["cartId"])
    .index("cartId_variantId", ["cartId", "variantId"])
    .index("productId", ["productId"])
    .index("variantId", ["variantId"]),
  addresses: defineTable({
    userId: v.id("users"),
    title: v.string(),
    city: v.string(),
    district: v.string(),
    detail: v.string(),
    postalCode: v.string(),
    isDefault: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("userId_createdAt", ["userId", "createdAt"])
    .index("userId_isDefault", ["userId", "isDefault"]),
  orders: defineTable({
    userId: v.id("users"),
    orderNo: v.string(),
    cartId: v.optional(v.id("carts")),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("shipped"),
      v.literal("cancelled"),
    ),
    subtotal: v.number(),
    discount: v.number(),
    shippingFee: v.number(),
    total: v.number(),
    currency: v.string(),
    customerName: v.string(),
    customerPhone: v.string(),
    addressId: v.optional(v.id("addresses")),
    customerCity: v.string(),
    customerProvince: v.string(),
    customerAddress: v.string(),
    customerApartment: v.optional(v.string()),
    addressSnapshot: v.optional(
      v.object({
        title: v.optional(v.string()),
        city: v.string(),
        district: v.string(),
        detail: v.string(),
        postalCode: v.optional(v.string()),
        apartment: v.optional(v.string()),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("orderNo", ["orderNo"])
    .index("status", ["status"])
    .index("status_createdAt", ["status", "createdAt"])
    .index("userId", ["userId"])
    .index("userId_createdAt", ["userId", "createdAt"])
    .index("createdAt", ["createdAt"]),
  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.optional(v.id("products")),
    variantId: v.optional(v.id("productVariants")),
    name: v.string(),
    productName: v.string(),
    sku: v.optional(v.string()),
    unitPriceSnapshot: v.number(),
    productPrice: v.number(),
    productImage: v.string(),
    quantity: v.number(),
    createdAt: v.number(),
  })
    .index("orderId", ["orderId"])
    .index("productId", ["productId"])
    .index("variantId", ["variantId"]),
  wishlists: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    createdAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("userId_productId", ["userId", "productId"])
    .index("userId_createdAt", ["userId", "createdAt"])
    .index("productId", ["productId"])
    .index("createdAt", ["createdAt"]),
  reviews: defineTable({
    productId: v.id("products"),
    userId: v.id("users"),
    rating: v.number(),
    comment: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("productId_status", ["productId", "status"])
    .index("productId_createdAt", ["productId", "createdAt"])
    .index("status_createdAt", ["status", "createdAt"])
    .index("userId_productId", ["userId", "productId"])
    .index("createdAt", ["createdAt"]),
  userProfiles: defineTable({
    userId: v.id("users"),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.union(v.literal("customer"), v.literal("admin")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("role", ["role"])
    .index("createdAt", ["createdAt"]),
});
