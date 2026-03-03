import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import YonetimUrunlerPageClient from "@/components/routes/admin/YonetimUrunlerPageClient";
import { requireAdminToken } from "@/lib/auth-server";

export default async function YonetimUrunlerPage() {
  const token = await requireAdminToken();
  const preloadedProducts = await preloadQuery(
    api.admin.listAdminProducts,
    { paginationOpts: { numItems: 50, cursor: null } },
    { token }
  );

  return <YonetimUrunlerPageClient preloadedProducts={preloadedProducts} />;
}
