import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { sanitizeText, slugify } from "./helpers";
import { assertAdmin } from "./permissions";
import { resolveVariantImageUrl } from "./productImages";
import { paginationOptsValidator } from "convex/server";

type AnyCtx = QueryCtx | MutationCtx;

type VariantInput = {
  sku: string;
  attributes: Record<string, string>;
  imageStorageId: Id<"_storage">;
  price: number;
  stock: number;
  isActive?: boolean;
};

type NormalizedVariant = {
  sku: string;
  attributes: Record<string, string>;
  imageStorageId: Id<"_storage">;
  price: number;
  stock: number;
  isActive: boolean;
};

function sanitizeAttributes(attributes: Record<string, string>) {
  return Object.entries(attributes).reduce<Record<string, string>>((result, [key, value]) => {
    const normalizedKey = sanitizeText(key);
    const normalizedValue = sanitizeText(value);
    if (!normalizedKey || !normalizedValue) {
      return result;
    }

    result[normalizedKey] = normalizedValue;
    return result;
  }, {});
}

function normalizeVariants(variants: VariantInput[]) {
  const skuSet = new Set<string>();
  const normalized = variants.map((variant) => {
    const sku = sanitizeText(variant.sku).toUpperCase();
    if (!sku) {
      throw new Error("Varyant SKU zorunlu");
    }
    if (skuSet.has(sku)) {
      throw new Error("Ayni SKU birden fazla kez kullanilamaz");
    }
    skuSet.add(sku);

    if (variant.price < 0) {
      throw new Error("Varyant fiyati negatif olamaz");
    }
    if (variant.stock < 0) {
      throw new Error("Varyant stogu negatif olamaz");
    }

    return {
      sku,
      attributes: sanitizeAttributes(variant.attributes),
      imageStorageId: variant.imageStorageId,
      price: variant.price,
      stock: variant.stock,
      isActive: variant.isActive ?? true,
    } satisfies NormalizedVariant;
  });

  if (normalized.length === 0) {
    throw new Error("En az bir varyant zorunlu");
  }

  return normalized;
}

async function assertVariantSkusAvailable(
  ctx: MutationCtx,
  variants: NormalizedVariant[],
  productId?: Id<"products">,
) {
  for (const variant of variants) {
    const existing = await ctx.db
      .query("productVariants")
      .withIndex("sku", (queryBuilder) => queryBuilder.eq("sku", variant.sku))
      .first();

    if (existing && existing.productId !== productId) {
      throw new Error(`SKU zaten kullaniliyor: ${variant.sku}`);
    }
  }
}

async function assertVariantImagesExist(ctx: MutationCtx, variants: NormalizedVariant[]) {
  for (const variant of variants) {
    const imageExists = await ctx.db.system.get(variant.imageStorageId);
    if (!imageExists) {
      throw new Error(`Varyant gorseli bulunamadi: ${variant.sku}`);
    }
  }
}

async function getCategoryMap(ctx: AnyCtx) {
  const categories = await ctx.db.query("categories").collect();
  return new Map(categories.map((category) => [category._id, category]));
}

async function getProductVariants(
  ctx: AnyCtx,
  productId: Id<"products">,
  includeInactive: boolean,
) {
  if (includeInactive) {
    const variants = await ctx.db
      .query("productVariants")
      .withIndex("productId", (queryBuilder) => queryBuilder.eq("productId", productId))
      .collect();

    return variants.sort((a, b) => a.createdAt - b.createdAt);
  }

  const variants = await ctx.db
    .query("productVariants")
    .withIndex("productId_isActive", (queryBuilder) =>
      queryBuilder.eq("productId", productId).eq("isActive", true),
    )
    .collect();

  return variants.sort((a, b) => a.createdAt - b.createdAt);
}

function sortProducts<T extends { isFeatured: boolean; createdAt: number }>(products: T[]) {
  return products.sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) {
      return a.isFeatured ? -1 : 1;
    }

    return b.createdAt - a.createdAt;
  });
}

function getVariantLabel(attributes: Record<string, string>, sku: string) {
  const parts = Object.entries(attributes).map(([key, value]) => `${key}: ${value}`);
  if (parts.length === 0) {
    return sku;
  }

  return parts.join(" / ");
}

function getProductDisplayFromVariants(variants: Array<{ price: number; stock: number }>) {
  return {
    price: Math.min(...variants.map((variant) => variant.price)),
    stock: variants.reduce((total, variant) => total + variant.stock, 0),
  };
}

async function replaceProductVariants(
  ctx: MutationCtx,
  productId: Id<"products">,
  variants: NormalizedVariant[],
  now: number,
) {
  const existingVariants = await ctx.db
    .query("productVariants")
    .withIndex("productId", (queryBuilder) => queryBuilder.eq("productId", productId))
    .collect();

  const previousImageIds = new Set(existingVariants.map((variant) => variant.imageStorageId));
  const nextImageIds = new Set(variants.map((variant) => variant.imageStorageId));

  await Promise.all(existingVariants.map((variant) => ctx.db.delete(variant._id)));

  await Promise.all(
    variants.map((variant) =>
      ctx.db.insert("productVariants", {
        productId,
        sku: variant.sku,
        attributes: variant.attributes,
        imageStorageId: variant.imageStorageId,
        price: variant.price,
        stock: variant.stock,
        isActive: variant.isActive,
        createdAt: now,
        updatedAt: now,
      }),
    ),
  );

  const removableImageIds = [...previousImageIds].filter(
    (imageStorageId) => !nextImageIds.has(imageStorageId),
  );
  await Promise.all(removableImageIds.map((imageStorageId) => ctx.storage.delete(imageStorageId)));
}

const variantArgsValidator = v.object({
  sku: v.string(),
  attributes: v.record(v.string(), v.string()),
  imageStorageId: v.id("_storage"),
  price: v.number(),
  stock: v.number(),
  isActive: v.optional(v.boolean()),
});

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

    const result = await Promise.all(
      sorted.map(async (product) => {
        const [category, variants] = await Promise.all([
          categoryMap.get(product.categoryId),
          getProductVariants(ctx, product._id, false),
        ]);

        if (variants.length === 0) {
          return null;
        }

        const display = getProductDisplayFromVariants(variants);
        const defaultVariant = variants[0];

        return {
          ...product,
          price: display.price,
          stock: display.stock,
          image: await resolveVariantImageUrl(ctx, defaultVariant),
          categoryName: category?.name ?? "",
          categorySlug: category?.slug ?? "",
          defaultVariantId: defaultVariant._id,
          hasVariants: true,
          variantCount: variants.length,
        };
      }),
    );

    return result.filter((item) => item !== null);
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

    const [category, variants] = await Promise.all([
      categoryMap.get(product.categoryId),
      getProductVariants(ctx, product._id, false),
    ]);

    if (variants.length === 0) {
      return null;
    }

    const display = getProductDisplayFromVariants(variants);

    return {
      ...product,
      price: display.price,
      stock: display.stock,
      image: await resolveVariantImageUrl(ctx, variants[0]),
      categoryName: category?.name ?? "",
      categorySlug: category?.slug ?? "",
      variants: await Promise.all(
        variants.map(async (variant) => ({
          ...variant,
          image: await resolveVariantImageUrl(ctx, variant),
          label: getVariantLabel(variant.attributes, variant.sku),
        })),
      ),
    };
  },
});

export const listAdmin = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const categoryMap = await getCategoryMap(ctx);

    const result = await ctx.db
      .query("products")
      .order("desc")
      .paginate(args.paginationOpts);

    const productsWithDetails = await Promise.all(
      result.page.map(async (product) => {
        const [category, variants] = await Promise.all([
          categoryMap.get(product.categoryId),
          getProductVariants(ctx, product._id, true),
        ]);

        const display =
          variants.length > 0
            ? getProductDisplayFromVariants(variants)
            : { price: 0, stock: 0 };

        return {
          ...product,
          price: display.price,
          stock: display.stock,
          imageUrl:
            variants.length > 0
              ? await resolveVariantImageUrl(ctx, variants[0])
              : "",
          categoryName: category?.name ?? "",
          variantCount: variants.length,
        };
      }),
    );

    return {
      ...result,
      page: productsWithDetails,
    };
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

    const [category, variants] = await Promise.all([
      categoryMap.get(product.categoryId),
      getProductVariants(ctx, product._id, true),
    ]);

    const display =
      variants.length > 0
        ? getProductDisplayFromVariants(variants)
        : { price: 0, stock: 0 };

    return {
      ...product,
      price: display.price,
      stock: display.stock,
      imageUrl:
        variants.length > 0
          ? await resolveVariantImageUrl(ctx, variants[0])
          : "",
      categoryName: category?.name ?? "",
      variants: await Promise.all(
        variants.map(async (variant) => ({
          ...variant,
          image: await resolveVariantImageUrl(ctx, variant),
          label: getVariantLabel(variant.attributes, variant.sku),
        })),
      ),
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    slug: v.optional(v.string()),
    categoryId: v.id("categories"),
    variants: v.array(variantArgsValidator),
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

    const variants = normalizeVariants(args.variants);
    await assertVariantSkusAvailable(ctx, variants);
    await assertVariantImagesExist(ctx, variants);

    const now = Date.now();
    const productId = await ctx.db.insert("products", {
      name,
      slug,
      description: sanitizeText(args.description),
      categoryId: args.categoryId,
      isActive: args.isActive ?? true,
      isFeatured: args.isFeatured ?? false,
      createdAt: now,
      updatedAt: now,
    });

    await replaceProductVariants(ctx, productId, variants, now);
    return productId;
  },
});

export const update = mutation({
  args: {
    productId: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    slug: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    variants: v.optional(v.array(variantArgsValidator)),
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

    const nextVariants =
      args.variants !== undefined ? normalizeVariants(args.variants) : undefined;
    if (nextVariants) {
      await assertVariantSkusAvailable(ctx, nextVariants, product._id);
      await assertVariantImagesExist(ctx, nextVariants);
    }

    const now = Date.now();

    await ctx.db.patch(args.productId, {
      name: nextName,
      slug: nextSlug,
      description:
        args.description !== undefined
          ? sanitizeText(args.description)
          : product.description,
      categoryId: args.categoryId ?? product.categoryId,
      isActive: args.isActive ?? product.isActive,
      isFeatured: args.isFeatured ?? product.isFeatured,
      updatedAt: now,
    });

    if (nextVariants) {
      await replaceProductVariants(ctx, product._id, nextVariants, now);
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

    const variants = await ctx.db
      .query("productVariants")
      .withIndex("productId", (queryBuilder) =>
        queryBuilder.eq("productId", args.productId),
      )
      .collect();

    await Promise.all(variants.map((variant) => ctx.db.delete(variant._id)));
    await Promise.all(variants.map((variant) => ctx.storage.delete(variant.imageStorageId)));

    await ctx.db.delete(args.productId);
  },
});
