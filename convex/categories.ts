import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { sanitizeText, slugify } from "./helpers";
import { assertAdmin } from "./permissions";

export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("isActive", (queryBuilder) => queryBuilder.eq("isActive", true))
      .collect();

    return categories.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }

      return a.name.localeCompare(b.name, "tr");
    });
  },
});

export const listAdmin = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);

    const categories = await ctx.db.query("categories").collect();
    return categories.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }

      return a.name.localeCompare(b.name, "tr");
    });
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    slug: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const name = sanitizeText(args.name);
    if (!name) {
      throw new Error("Kategori adi zorunlu");
    }

    const slugBase = sanitizeText(args.slug ?? name);
    const slug = slugify(slugBase);
    if (!slug) {
      throw new Error("Gecerli bir slug gerekli");
    }

    const existing = await ctx.db
      .query("categories")
      .withIndex("slug", (queryBuilder) => queryBuilder.eq("slug", slug))
      .first();
    if (existing) {
      throw new Error("Bu slug zaten kullaniliyor");
    }

    const now = Date.now();

    return await ctx.db.insert("categories", {
      name,
      slug,
      description: args.description ? sanitizeText(args.description) : undefined,
      isActive: args.isActive ?? true,
      sortOrder: args.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    slug: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Kategori bulunamadi");
    }

    const nextName = args.name !== undefined ? sanitizeText(args.name) : category.name;
    if (!nextName) {
      throw new Error("Kategori adi zorunlu");
    }

    const slugInput = args.slug !== undefined ? sanitizeText(args.slug) : nextName;
    const nextSlug = slugify(slugInput);
    if (!nextSlug) {
      throw new Error("Gecerli bir slug gerekli");
    }

    if (nextSlug !== category.slug) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("slug", (queryBuilder) => queryBuilder.eq("slug", nextSlug))
        .first();
      if (existing && existing._id !== category._id) {
        throw new Error("Bu slug zaten kullaniliyor");
      }
    }

    await ctx.db.patch(args.categoryId, {
      name: nextName,
      slug: nextSlug,
      description:
        args.description !== undefined
          ? sanitizeText(args.description) || undefined
          : category.description,
      isActive: args.isActive ?? category.isActive,
      sortOrder: args.sortOrder ?? category.sortOrder,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const products = await ctx.db
      .query("products")
      .withIndex("categoryId", (queryBuilder) => queryBuilder.eq("categoryId", args.categoryId))
      .collect();

    if (products.length > 0) {
      throw new Error("Bu kategoriye bagli urunler var");
    }

    await ctx.db.delete(args.categoryId);
  },
});

