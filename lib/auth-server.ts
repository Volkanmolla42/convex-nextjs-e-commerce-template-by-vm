import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { isAdmin } from "@/lib/admin";

export async function requireAuthToken() {
  const token = await convexAuthNextjsToken();
  if (!token) {
    redirect("/giris");
  }

  return token;
}

export async function requireAdminToken() {
  const token = await requireAuthToken();
  const currentUser = await fetchQuery(api.userFunctions.currentUser, {}, { token });

  if (!isAdmin(currentUser)) {
    redirect("/");
  }

  return token;
}
