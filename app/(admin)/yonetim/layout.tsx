import type { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { requireAdminToken } from "@/lib/auth-server";

export default async function YonetimLayout({ children }: { children: ReactNode }) {
  await requireAdminToken();

  return (
    <main className="container mx-auto px-4 pb-16 pt-28 sm:pt-32">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <AdminSidebar />
        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </main>
  );
}
