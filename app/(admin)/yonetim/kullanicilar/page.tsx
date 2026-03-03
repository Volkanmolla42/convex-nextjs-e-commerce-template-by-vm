import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import YonetimKullanicilarPageClient from "@/components/routes/admin/YonetimKullanicilarPageClient";
import { requireAdminToken } from "@/lib/auth-server";

export default async function YonetimKullanicilarPage() {
  const token = await requireAdminToken();
  const preloadedAdmins = await preloadQuery(api.admin.listAdmins, {}, { token });

  return <YonetimKullanicilarPageClient preloadedAdmins={preloadedAdmins} />;
}
