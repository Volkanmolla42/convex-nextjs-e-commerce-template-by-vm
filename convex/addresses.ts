import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

type AnyCtx = MutationCtx | QueryCtx;

async function getRequiredUserId(ctx: AnyCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Giris gerekli");
  }

  return userId;
}

function normalizeField(value: string) {
  return value.trim();
}

function validateRequired(value: string, fieldName: string) {
  if (!value) {
    throw new Error(`${fieldName} zorunlu`);
  }
}

async function getUserAddresses(
  ctx: AnyCtx,
  userId: Id<"users">,
) {
  return await ctx.db
    .query("addresses")
    .withIndex("userId", (queryBuilder) => queryBuilder.eq("userId", userId))
    .collect();
}

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const addresses = await ctx.db
      .query("addresses")
      .withIndex("userId", (queryBuilder) => queryBuilder.eq("userId", userId))
      .collect();

    return addresses.sort((a, b) => {
      if (a.isDefault !== b.isDefault) {
        return Number(b.isDefault) - Number(a.isDefault);
      }

      return b.createdAt - a.createdAt;
    });
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    city: v.string(),
    district: v.string(),
    detail: v.string(),
    postalCode: v.string(),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getRequiredUserId(ctx);
    const title = normalizeField(args.title);
    const city = normalizeField(args.city);
    const district = normalizeField(args.district);
    const detail = normalizeField(args.detail);
    const postalCode = normalizeField(args.postalCode);
    const now = Date.now();

    validateRequired(title, "Adres basligi");
    validateRequired(city, "Sehir");
    validateRequired(district, "Ilce");
    validateRequired(detail, "Adres detayi");
    validateRequired(postalCode, "Posta kodu");

    const addresses = await getUserAddresses(ctx, userId);
    const shouldBeDefault = args.isDefault || addresses.length === 0;

    if (shouldBeDefault) {
      await Promise.all(
        addresses
          .filter((address) => address.isDefault)
          .map((address) => ctx.db.patch(address._id, { isDefault: false, updatedAt: now })),
      );
    }

    return await ctx.db.insert("addresses", {
      userId,
      title,
      city,
      district,
      detail,
      postalCode,
      isDefault: shouldBeDefault,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    addressId: v.id("addresses"),
    title: v.string(),
    city: v.string(),
    district: v.string(),
    detail: v.string(),
    postalCode: v.string(),
    isDefault: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getRequiredUserId(ctx);
    const address = await ctx.db.get(args.addressId);
    if (!address || address.userId !== userId) {
      throw new Error("Adres bulunamadi");
    }

    const title = normalizeField(args.title);
    const city = normalizeField(args.city);
    const district = normalizeField(args.district);
    const detail = normalizeField(args.detail);
    const postalCode = normalizeField(args.postalCode);
    const now = Date.now();

    validateRequired(title, "Adres basligi");
    validateRequired(city, "Sehir");
    validateRequired(district, "Ilce");
    validateRequired(detail, "Adres detayi");
    validateRequired(postalCode, "Posta kodu");

    const addresses = await getUserAddresses(ctx, userId);

    if (args.isDefault) {
      await Promise.all(
        addresses
          .filter((item) => item._id !== address._id && item.isDefault)
          .map((item) => ctx.db.patch(item._id, { isDefault: false, updatedAt: now })),
      );
    } else if (address.isDefault) {
      const nextDefaultAddress = addresses.find((item) => item._id !== address._id);
      if (nextDefaultAddress) {
        await ctx.db.patch(nextDefaultAddress._id, { isDefault: true, updatedAt: now });
      }
    }

    await ctx.db.patch(address._id, {
      title,
      city,
      district,
      detail,
      postalCode,
      isDefault: args.isDefault,
      updatedAt: now,
    });

    return await ctx.db.get(address._id);
  },
});

export const setDefault = mutation({
  args: {
    addressId: v.id("addresses"),
  },
  handler: async (ctx, args) => {
    const userId = await getRequiredUserId(ctx);
    const address = await ctx.db.get(args.addressId);

    if (!address || address.userId !== userId) {
      throw new Error("Adres bulunamadi");
    }

    const now = Date.now();
    const addresses = await getUserAddresses(ctx, userId);

    await Promise.all(
      addresses
        .filter((item) => item.isDefault && item._id !== address._id)
        .map((item) => ctx.db.patch(item._id, { isDefault: false, updatedAt: now })),
    );

    if (!address.isDefault) {
      await ctx.db.patch(address._id, { isDefault: true, updatedAt: now });
    }

    return await ctx.db.get(address._id);
  },
});
