"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { storeConfig } from "@/lib/store-config";
import { isAdminEmail } from "@/lib/admin";
import { ChevronDown, Menu, ShoppingBag, User, X } from "lucide-react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = useQuery(api.userFunctions.currentUser);
  const cart = useQuery(api.cart.getActive);
  const { signOut } = useAuthActions();

  const navItems = [
    { name: "KOLEKSIYONLAR", href: "/#collections" },
    { name: "HAKKIMIZDA", href: "/#about" },
    { name: "ILETISIM", href: "/#contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const isAdmin = isAdminEmail(user?.email);
  const cartCount = cart?.totalItems ?? 0;

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 border-navy/5 transition-all duration-500 ${
        scrolled
          ? "border-b border-navy/5 bg-paper/50 py-4 backdrop-blur-md"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link
          href="/"
          className="font-heading text-3xl tracking-wide text-navy"
          onClick={() => setMobileMenuOpen(false)}
        >
          {storeConfig.logo.text}
        </Link>
        <div className="flex items-center gap-3 md:gap-10">
          <nav className="hidden items-center gap-10 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative py-0.5 text-xs font-semibold tracking-200 text-navy/70 transition-all duration-300 hover:text-navy hover:tracking-wider"
              >
                <span className="absolute left-0 top-0 h-px w-full bg-navy/70 transition-all duration-500" />
                {item.name}
                <span className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-denim transition-transform duration-500 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            {user === undefined ? (
              <div className="hidden h-5 w-5 md:block" />
            ) : user ? (
              <div className="group/user relative hidden py-2 md:block">
                <span className="flex cursor-pointer items-center gap-1 text-sm tracking-wide text-navy/80 transition-colors duration-300 hover:text-navy">
                  {user.name || user.email}
                  <ChevronDown className="size-3 transition-transform duration-300 group-hover/user:-rotate-180" />
                </span>

                <div className="invisible absolute right-0 top-full z-50 w-48 translate-y-2 border border-navy/10 bg-paper opacity-0 backdrop-blur-md transition-all duration-300 group-hover/user:visible group-hover/user:translate-y-0 group-hover/user:opacity-100">
                  <div className="flex flex-col py-2">
                    <Link
                      href="/hesabim"
                      className="px-4 py-2 text-xs tracking-200 text-navy/70 transition-colors duration-200 hover:bg-navy/5 hover:text-navy"
                    >
                      HESABIM
                    </Link>
                    {isAdmin ? (
                      <Link
                        href="/yonetim"
                        className="px-4 py-2 text-xs tracking-200 text-navy/70 transition-colors duration-200 hover:bg-navy/5 hover:text-navy"
                      >
                        YONETIM
                      </Link>
                    ) : null}
                    <Button
                      type="button"
                      onClick={() => void signOut()}
                      variant="nav"
                      size="inline"
                      className="w-full justify-start text-left"
                    >
                      CIKIS YAP
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button asChild variant="ghost" size="icon-sm" className="group hidden text-navy/70 hover:text-navy md:inline-flex">
                <Link href="/giris">
                  <User className="size-5 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost" size="icon-sm" className="group relative text-navy/70 hover:text-navy">
              <Link href="/sepet" onClick={() => setMobileMenuOpen(false)}>
                <ShoppingBag className="size-5 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                <span className="absolute -right-2 -top-1.5 flex h-[14px] w-[14px] items-center justify-center rounded-full bg-denim pb-px text-[9px] font-semibold text-background dark:text-foreground">
                  {cartCount}
                </span>
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-navy/70 hover:text-navy md:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Menuyu kapat" : "Menuyu ac"}
            >
              {mobileMenuOpen ? (
                <X className="size-5" strokeWidth={1.5} />
              ) : (
                <Menu className="size-5" strokeWidth={1.5} />
              )}
            </Button>
          </div>
        </div>
      </div>
      <div
        className={`overflow-hidden border-navy/10 bg-paper/95 backdrop-blur-md transition-all duration-500 md:hidden ${
          mobileMenuOpen ? "max-h-[420px] border-t" : "max-h-0"
        }`}
      >
        <div className="container mx-auto px-4 py-5">
          <nav className="flex flex-col">
            {navItems.map((item) => (
              <Button
                key={item.name}
                asChild
                variant="nav"
                size="inline"
                className="h-11 w-full justify-between px-0 text-xs tracking-200"
              >
                <Link href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  {item.name}
                  <span aria-hidden className="text-base leading-none text-denim/70">
                    ↗
                  </span>
                </Link>
              </Button>
            ))}
            <div className="mt-3 border-t border-navy/10 pt-3">
              {user ? (
                <>
                  <Button
                    asChild
                    variant="nav"
                    size="inline"
                    className="h-11 w-full justify-start px-0 text-xs tracking-200"
                  >
                    <Link href="/hesabim" onClick={() => setMobileMenuOpen(false)}>
                      HESABIM
                    </Link>
                  </Button>
                  {isAdmin ? (
                    <Button
                      asChild
                      variant="nav"
                      size="inline"
                      className="h-11 w-full justify-start px-0 text-xs tracking-200"
                    >
                      <Link href="/yonetim" onClick={() => setMobileMenuOpen(false)}>
                        YONETIM
                      </Link>
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    onClick={() => {
                      void signOut();
                      setMobileMenuOpen(false);
                    }}
                    variant="nav"
                    size="inline"
                    className="h-11 w-full justify-start px-0 text-xs tracking-200"
                  >
                    CIKIS YAP
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  variant="nav"
                  size="inline"
                  className="h-11 w-full justify-start px-0 text-xs tracking-200"
                >
                  <Link href="/giris" onClick={() => setMobileMenuOpen(false)}>
                    GIRIS YAP
                  </Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
