import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen py-16">
      <Header />
      {children}
      <Footer />
    </main>
  );
}
