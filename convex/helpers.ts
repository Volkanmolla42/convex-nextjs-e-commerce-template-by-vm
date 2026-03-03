import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

type AnyCtx = QueryCtx | MutationCtx;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function sanitizeText(value: string): string {
  return value.trim();
}

export async function getRequiredUserId(ctx: AnyCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Giris gerekli");
  }
  return userId;
}

export function getVariantLabel(attributes: Record<string, string>, sku: string): string {
  const parts = Object.entries(attributes).map(([key, value]) => `${key}: ${value}`);
  if (parts.length === 0) {
    return sku;
  }
  return parts.join(" / ");
}

export async function findActiveCartByUserId(ctx: AnyCtx, userId: Id<"users">) {
  return await ctx.db
    .query("carts")
    .withIndex("userId_status", (q) =>
      q.eq("userId", userId).eq("status", "active"),
    )
    .first();
}

