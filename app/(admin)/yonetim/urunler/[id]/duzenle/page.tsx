import { preloadQuery } from "convex/nextjs";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import YonetimUrunDuzenlePageClient from "@/components/routes/admin/YonetimUrunDuzenlePageClient";
import { requireAdminToken } from "@/lib/auth-server";

type YonetimUrunDuzenlePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function YonetimUrunDuzenlePage({ params }: YonetimUrunDuzenlePageProps) {
  const { id } = await params;
  const token = await requireAdminToken();

  const [preloadedProduct, preloadedCategories] = await Promise.all([
    preloadQuery(api.admin.getAdminProductById, { productId: id as Id<"products"> }, { token }),
    preloadQuery(api.admin.listAdminCategories, {}, { token }),
  ]);

  return (
    <YonetimUrunDuzenlePageClient
      preloadedProduct={preloadedProduct}
      preloadedCategories={preloadedCategories}
    />
  );
}
