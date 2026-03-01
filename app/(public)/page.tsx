import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import HomePageClient from "@/components/routes/public/HomePageClient";

export default async function LandingPage() {
  const [preloadedProducts, preloadedCategories] = await Promise.all([
    preloadQuery(api.catalog.listPublicProducts),
    preloadQuery(api.catalog.listPublicCategories),
  ]);

  return (
    <HomePageClient
      preloadedProducts={preloadedProducts}
      preloadedCategories={preloadedCategories}
    />
  );
}
