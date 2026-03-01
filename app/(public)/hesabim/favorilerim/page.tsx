import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import HesabimFavorilerimPageClient from "@/components/routes/public/HesabimFavorilerimPageClient";
import { requireAuthToken } from "@/lib/auth-server";

export default async function HesabimFavorilerimPage() {
  const token = await requireAuthToken();
  const preloadedWishlist = await preloadQuery(api.wishlist.listMine, {}, { token });

  return <HesabimFavorilerimPageClient preloadedWishlist={preloadedWishlist} />;
}
