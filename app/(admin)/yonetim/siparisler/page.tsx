import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import YonetimSiparislerPageClient from "@/components/routes/admin/YonetimSiparislerPageClient";
import { requireAdminToken } from "@/lib/auth-server";

export default async function YonetimSiparislerPage() {
  const token = await requireAdminToken();
  const preloadedOrders = await preloadQuery(
    api.admin.listAdminOrders,
    { paginationOpts: { numItems: 50, cursor: null } },
    { token }
  );

  return <YonetimSiparislerPageClient preloadedOrders={preloadedOrders} />;
}
