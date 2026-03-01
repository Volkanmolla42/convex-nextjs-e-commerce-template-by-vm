import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import YonetimKategorilerPageClient from "@/components/routes/admin/YonetimKategorilerPageClient";
import { requireAdminToken } from "@/lib/auth-server";

export default async function YonetimKategorilerPage() {
  const token = await requireAdminToken();
  const preloadedCategories = await preloadQuery(api.admin.listAdminCategories, {}, { token });

  return <YonetimKategorilerPageClient preloadedCategories={preloadedCategories} />;
}
