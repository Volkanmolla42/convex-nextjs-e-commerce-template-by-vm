"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, FolderTree, LayoutDashboard, MessageSquare, PackagePlus, ReceiptText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const adminLinks = [
  { href: "/yonetim", label: "Panel", icon: LayoutDashboard },
  { href: "/yonetim/urun-ekle", label: "Urun Ekle", icon: PackagePlus },
  { href: "/yonetim/urunler", label: "Urunler", icon: Box },
  { href: "/yonetim/kategoriler", label: "Kategoriler", icon: FolderTree },
  { href: "/yonetim/siparisler", label: "Siparisler", icon: ReceiptText },
  { href: "/yonetim/yorumlar", label: "Yorumlar", icon: MessageSquare },
  { href: "/yonetim/kullanicilar", label: "Kullanicilar", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full rounded-lg border border-border bg-background p-4 lg:w-64 lg:shrink-0">
      <nav className="flex flex-col gap-2">
        {adminLinks.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? "default" : "outlineGold"}
              className="justify-start"
            >
              <Link href={item.href}>
                <item.icon className="mr-2 size-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}

