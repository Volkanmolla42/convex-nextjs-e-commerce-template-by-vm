import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import HesabimAdreslerPageClient from "@/components/routes/public/HesabimAdreslerPageClient";
import { requireAuthToken } from "@/lib/auth-server";

export default async function HesabimAdreslerimPage() {
  const token = await requireAuthToken();
  const preloadedAddresses = await preloadQuery(api.addresses.listMine, {}, { token });

  return <HesabimAdreslerPageClient preloadedAddresses={preloadedAddresses} />;
}
