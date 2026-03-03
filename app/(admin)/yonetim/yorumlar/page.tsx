import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import YonetimYorumlarPageClient from "@/components/routes/admin/YonetimYorumlarPageClient";
import { requireAdminToken } from "@/lib/auth-server";

export default async function YonetimYorumlarPage() {
  const token = await requireAdminToken();
  const preloadedReviews = await preloadQuery(
    api.admin.listPendingReviews,
    { paginationOpts: { numItems: 50, cursor: null } },
    { token }
  );

  return <YonetimYorumlarPageClient preloadedReviews={preloadedReviews} />;
}
