"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ADMIN_ROOT_PATH = "/yonetim";

function isAdminRoute(pathname: string) {
  return pathname === ADMIN_ROOT_PATH || pathname.startsWith(`${ADMIN_ROOT_PATH}/`);
}

export default function LayoutChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideChrome = isAdminRoute(pathname);

  return (
    <main className="text-navy min-h-screen">
      {!hideChrome && <Header />}
      {children}
      {!hideChrome && <Footer />}
    </main>
  );
}
