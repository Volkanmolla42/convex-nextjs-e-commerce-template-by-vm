import { preloadQuery } from "convex/nextjs";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import UrunPageClient from "@/components/routes/public/UrunPageClient";

type UrunDetayPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UrunDetayPage({ params }: UrunDetayPageProps) {
  const { id } = await params;

  const [preloadedProduct, preloadedProducts] = await Promise.all([
    preloadQuery(api.catalog.getPublicProductById, { productId: id as Id<"products"> }),
    preloadQuery(api.catalog.listPublicProducts),
  ]);

  return (
    <UrunPageClient
      preloadedProduct={preloadedProduct}
      preloadedProducts={preloadedProducts}
    />
  );
}
