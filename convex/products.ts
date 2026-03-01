import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { sanitizeText, slugify } from "./helpers";
import { assertAdmin } from "./permissions";
import { resolveProductImageUrl } from "./productImages";

async function getCategoryMap(ctx: QueryCtx | MutationCtx) {
  const categories = await ctx.db.query("categories").collect();
  return new Map(categories.map((category) => [category._id, category]));
}

function sortProducts<T extends { isFeatured: boolean; createdAt: number }>(
  products: T[],
) {
  return products.sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) {
      return a.isFeatured ? -1 : 1;
    }

    return b.createdAt - a.createdAt;
  });
}

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    const [products, categoryMap] = await Promise.all([
      ctx.db
        .query("products")
        .withIndex("isActive", (queryBuilder) => queryBuilder.eq("isActive", true))
        .collect(),
      getCategoryMap(ctx),
    ]);

    const sorted = sortProducts(products);

    return await Promise.all(
      sorted.map(async (product) => {
        const category = categoryMap.get(product.categoryId);
        return {
          ...product,
          image: await resolveProductImageUrl(ctx, product),
          categoryName: category?.name ?? "",
          categorySlug: category?.slug ?? "",
        };
      }),
    );
  },
});

export const getById = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const [product, categoryMap] = await Promise.all([
      ctx.db.get(args.productId),
      getCategoryMap(ctx),
    ]);

    if (!product || !product.isActive) {
      return null;
    }

    const category = categoryMap.get(product.categoryId);
    return {
      ...product,
      image: await resolveProductImageUrl(ctx, product),
      categoryName: category?.name ?? "",
      categorySlug: category?.slug ?? "",
    };
  },
});

export const listAdmin = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);

    const [products, categoryMap] = await Promise.all([
      ctx.db.query("products").collect(),
      getCategoryMap(ctx),
    ]);

    const sorted = sortProducts(products);

    return await Promise.all(
      sorted.map(async (product) => {
        const category = categoryMap.get(product.categoryId);
        return {
          ...product,
          imageUrl: await resolveProductImageUrl(ctx, product),
          categoryName: category?.name ?? "",
        };
      }),
    );
  },
});

export const getAdminById = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const [product, categoryMap] = await Promise.all([
      ctx.db.get(args.productId),
      getCategoryMap(ctx),
    ]);

    if (!product) {
      return null;
    }

    const category = categoryMap.get(product.categoryId);
    return {
      ...product,
      imageUrl: await resolveProductImageUrl(ctx, product),
      categoryName: category?.name ?? "",
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    details: v.string(),
    careInstructions: v.string(),
    slug: v.optional(v.string()),
    price: v.number(),
    imageStorageId: v.id("_storage"),
    categoryId: v.id("categories"),
    stock: v.number(),
    isActive: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Kategori bulunamadi");
    }

    const name = sanitizeText(args.name);
    if (!name) {
      throw new Error("Urun adi zorunlu");
    }

    const imageExists = await ctx.storage.getMetadata(args.imageStorageId);
    if (!imageExists) {
      throw new Error("Gorsel bulunamadi");
    }

    const slug = slugify(sanitizeText(args.slug ?? name));
    if (!slug) {
      throw new Error("Gecerli bir slug gerekli");
    }

    const existing = await ctx.db
      .query("products")
      .withIndex("slug", (queryBuilder) => queryBuilder.eq("slug", slug))
      .first();
    if (existing) {
      throw new Error("Bu slug zaten kullaniliyor");
    }

    if (args.price < 0) {
      throw new Error("Fiyat negatif olamaz");
    }

    if (args.stock < 0) {
      throw new Error("Stok negatif olamaz");
    }

    const now = Date.now();
    return await ctx.db.insert("products", {
      name,
      slug,
      description: sanitizeText(args.description),
      details: sanitizeText(args.details),
      careInstructions: sanitizeText(args.careInstructions),
      price: args.price,
      imageStorageId: args.imageStorageId,
      categoryId: args.categoryId,
      stock: args.stock,
      isActive: args.isActive ?? true,
      isFeatured: args.isFeatured ?? false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    productId: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    details: v.optional(v.string()),
    careInstructions: v.optional(v.string()),
    slug: v.optional(v.string()),
    price: v.optional(v.number()),
    imageStorageId: v.optional(v.id("_storage")),
    categoryId: v.optional(v.id("categories")),
    stock: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Urun bulunamadi");
    }

    if (args.categoryId) {
      const category = await ctx.db.get(args.categoryId);
      if (!category) {
        throw new Error("Kategori bulunamadi");
      }
    }

    if (args.imageStorageId) {
      const imageExists = await ctx.storage.getMetadata(args.imageStorageId);
      if (!imageExists) {
        throw new Error("Gorsel bulunamadi");
      }
    }

    const nextName = args.name !== undefined ? sanitizeText(args.name) : product.name;
    if (!nextName) {
      throw new Error("Urun adi zorunlu");
    }

    const slugInput = args.slug !== undefined ? sanitizeText(args.slug) : nextName;
    const nextSlug = slugify(slugInput);
    if (!nextSlug) {
      throw new Error("Gecerli bir slug gerekli");
    }

    if (nextSlug !== product.slug) {
      const existing = await ctx.db
        .query("products")
        .withIndex("slug", (queryBuilder) => queryBuilder.eq("slug", nextSlug))
        .first();
      if (existing && existing._id !== product._id) {
        throw new Error("Bu slug zaten kullaniliyor");
      }
    }

    if (args.price !== undefined && args.price < 0) {
      throw new Error("Fiyat negatif olamaz");
    }

    if (args.stock !== undefined && args.stock < 0) {
      throw new Error("Stok negatif olamaz");
    }

    const previousImageStorageId = product.imageStorageId;

    await ctx.db.patch(args.productId, {
      name: nextName,
      slug: nextSlug,
      description:
        args.description !== undefined
          ? sanitizeText(args.description)
          : product.description,
      details:
        args.details !== undefined
          ? sanitizeText(args.details)
          : product.details,
      careInstructions:
        args.careInstructions !== undefined
          ? sanitizeText(args.careInstructions)
          : product.careInstructions,
      price: args.price ?? product.price,
      imageStorageId: args.imageStorageId ?? product.imageStorageId,
      categoryId: args.categoryId ?? product.categoryId,
      stock: args.stock ?? product.stock,
      isActive: args.isActive ?? product.isActive,
      isFeatured: args.isFeatured ?? product.isFeatured,
      updatedAt: Date.now(),
    });

    if (args.imageStorageId && previousImageStorageId && previousImageStorageId !== args.imageStorageId) {
      await ctx.storage.delete(previousImageStorageId);
    }
  },
});

export const remove = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Urun bulunamadi");
    }

    if (product.imageStorageId) {
      await ctx.storage.delete(product.imageStorageId);
    }

    await ctx.db.delete(args.productId);
  },
});
