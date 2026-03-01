import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import YonetimPanelPageClient from "@/components/routes/admin/YonetimPanelPageClient";
import { requireAdminToken } from "@/lib/auth-server";

export default async function YonetimPanelPage() {
  const token = await requireAdminToken();

  const [preloadedUser, preloadedCategories, preloadedProducts, preloadedOrders] = await Promise.all([
    preloadQuery(api.userFunctions.currentUser, {}, { token }),
    preloadQuery(api.admin.listAdminCategories, {}, { token }),
    preloadQuery(api.admin.listAdminProducts, {}, { token }),
    preloadQuery(api.admin.listAdminOrders, {}, { token }),
  ]);

  return (
    <YonetimPanelPageClient
      preloadedUser={preloadedUser}
      preloadedCategories={preloadedCategories}
      preloadedProducts={preloadedProducts}
      preloadedOrders={preloadedOrders}
    />
  );
}
