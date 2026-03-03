import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

type AuthCtx = QueryCtx | MutationCtx;

export async function getCurrentUserOrNull(ctx: AuthCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
}

export async function getUserProfile(ctx: AuthCtx, userId: Id<"users">) {
  return await ctx.db
    .query("userProfiles")
    .withIndex("userId", (q) => q.eq("userId", userId))
    .first();
}

export async function isAdmin(ctx: AuthCtx): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    return false;
  }

  const profile = await getUserProfile(ctx, userId);
  return profile?.role === "admin";
}

export async function assertAdmin(ctx: AuthCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Giris gerekli");
  }

  const profile = await getUserProfile(ctx, userId);
  if (profile?.role !== "admin") {
    throw new Error("Yetkisiz");
  }

  return { userId, profile };
}
