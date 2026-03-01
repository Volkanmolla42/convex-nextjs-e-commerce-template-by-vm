import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import SepetPageClient from "@/components/routes/public/SepetPageClient";
import { requireAuthToken } from "@/lib/auth-server";

export default async function SepetPage() {
  const token = await requireAuthToken();
  const preloadedCart = await preloadQuery(api.cart.getActive, {}, { token });

  return <SepetPageClient preloadedCart={preloadedCart} />;
}
