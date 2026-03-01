"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MapPin, Settings, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/hesabim", label: "Siparislerim", icon: ShoppingBag },
  { href: "/hesabim/favorilerim", label: "Favorilerim", icon: Heart },
  { href: "/hesabim/adreslerim", label: "Adreslerim", icon: MapPin },
  { href: "/hesabim/ayarlar", label: "Ayarlar", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/hesabim") {
    return pathname === "/hesabim";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function HesabimSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
      {navItems.map((item) => {
        const active = isActivePath(pathname, item.href);
        const Icon = item.icon;

        return (
          <Button
            key={item.href}
            asChild
            variant="ghost"
            className={cn(
              "group/nav h-11 w-full justify-start gap-3 rounded-none border px-3 text-sm font-medium normal-case tracking-normal transition-all duration-300 hover:bg-muted hover-denim-corners",
              active
                ? "border-denim/40 bg-muted text-denim"
                : "border-border text-foreground hover:border-denim/40 hover:text-denim",
            )}
          >
            <Link href={item.href}>
              <Icon className="size-4 transition-transform duration-300 group-hover/nav:-translate-y-px" strokeWidth={1.6} />
              <span>{item.label}</span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
