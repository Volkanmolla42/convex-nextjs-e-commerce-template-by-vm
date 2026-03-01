import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import YonetimUrunEklePageClient from "@/components/routes/admin/YonetimUrunEklePageClient";
import { requireAdminToken } from "@/lib/auth-server";

export default async function YonetimUrunEklePage() {
  const token = await requireAdminToken();
  const preloadedCategories = await preloadQuery(api.admin.listAdminCategories, {}, { token });

  return <YonetimUrunEklePageClient preloadedCategories={preloadedCategories} />;
}
