import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const ADMIN_EMAIL = "volkanmolla11@gmail.com";

type AuthCtx = QueryCtx | MutationCtx;

export async function getCurrentUserOrNull(ctx: AuthCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }

  return await ctx.db.get(userId);
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return email.toLowerCase() === ADMIN_EMAIL;
}

export async function assertAdmin(ctx: AuthCtx) {
  const user = await getCurrentUserOrNull(ctx);
  if (!isAdminEmail(user?.email)) {
    throw new Error("Yetkisiz");
  }

  return user;
}
