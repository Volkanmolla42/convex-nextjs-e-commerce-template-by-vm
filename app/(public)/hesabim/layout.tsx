import type { ReactNode } from "react";
import { fetchQuery } from "convex/nextjs";
import HesabimSidebarNav from "@/components/routes/public/HesabimSidebarNav";
import { api } from "@/convex/_generated/api";
import { requireAuthToken } from "@/lib/auth-server";

type HesabimLayoutProps = {
  children: ReactNode;
};

export default async function HesabimLayout({ children }: HesabimLayoutProps) {
  const token = await requireAuthToken();
  const currentUser = await fetchQuery(api.userFunctions.currentUser, {}, { token });

  return (
    <section className="container mx-auto px-4 py-8 sm:py-10 lg:py-12 min-h-screen">
      <div className="grid gap-6 lg:grid-cols-4 lg:gap-8">
        <aside className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
          <div className="group border border-border bg-background p-4 transition-colors duration-500 hover:border-denim/40 hover-denim-corners sm:p-5">
            <h4>{currentUser?.name || currentUser?.email}</h4>
            <div className="mt-4">
              <HesabimSidebarNav />
            </div>
          </div>
        </aside>
        <div className="lg:col-span-3">
          <div className="group border border-border bg-background p-4 transition-colors duration-500 hover:border-denim/40 hover-denim-corners sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
