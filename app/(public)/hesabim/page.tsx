import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import HesabimSiparislerimPageClient from "@/components/routes/public/HesabimSiparislerimPageClient";
import { requireAuthToken } from "@/lib/auth-server";

export default async function HesabimPage() {
  const token = await requireAuthToken();
  const preloadedOrders = await preloadQuery(api.orders.listMine, {}, { token });

  return <HesabimSiparislerimPageClient preloadedOrders={preloadedOrders} />;
}
