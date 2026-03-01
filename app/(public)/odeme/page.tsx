import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import OdemePageClient from "@/components/routes/public/OdemePageClient";
import { requireAuthToken } from "@/lib/auth-server";

export default async function OdemePage() {
  const token = await requireAuthToken();
  const preloadedCart = await preloadQuery(api.cart.getActive, {}, { token });

  return <OdemePageClient preloadedCart={preloadedCart} />;
}
