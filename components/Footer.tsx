import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { storeConfig } from "@/lib/store-config";
import { ThemeToggle } from "./theme-toggle";

type FooterLink = {
  label: string;
  href: string;
  icon?: LucideIcon;
  external?: boolean;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

const footerSections: FooterSection[] = [
  {
    title: "ALISVERIS",
    links: [
      { label: "Koleksiyon", href: "/#collections" },
      { label: "One Cikanlar", href: "/#collections" },
      { label: "Yeni Gelenler", href: "/#collections" },
      { label: "Sepet", href: "/sepet" },
    ],
  },
  {
    title: "KURUMSAL",
    links: [
      { label: "Hesabim", href: "/hesabim" },
      { label: "Giris", href: "/giris" },
      { label: "Odeme", href: "/odeme" },
      { label: "Yonetim", href: "/yonetim" },
    ],
  },
  {
    title: "DESTEK",
    links: [
      { label: "Ana Sayfa", href: "/" },
      { label: "Koleksiyon", href: "/#collections" },
      { label: "Sepet", href: "/sepet" },
      { label: "Odeme", href: "/odeme" },
    ],
  },
  {
    title: "TAKIP ET",
    links: [
      {
        label: "Instagram",
        href: storeConfig.social.instagram,
        icon: Instagram,
        external: true,
      },
      {
        label: "X",
        href: storeConfig.social.x,
        external: true,
      },
    ],
  },
];

const policyLinks: FooterLink[] = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Koleksiyon", href: "/#collections" },
  { label: "Hesabim", href: "/hesabim" },
];

const contactItems = [
  { icon: MapPin, value: storeConfig.support.address },
  { icon: Phone, value: storeConfig.support.phone },
  { icon: Mail, value: storeConfig.support.email },
] as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="relative flex flex-col overflow-hidden bg-paper px-2 pb-20">
      <div
        aria-hidden="true"
        className="pointer-events-none w-full whitespace-nowrap py-6 text-center font-heading text-[13vw] leading-none tracking-180 text-navy/10"
      >
        {storeConfig.logo.text.toUpperCase()}
      </div>

      <div className="container z-10 mx-auto mb-14 grid grid-cols-1 gap-10 sm:mb-20 sm:gap-12 lg:mb-28 lg:grid-cols-12 lg:gap-8">
        <div className="mt-1 flex flex-col gap-4 sm:mt-2 sm:gap-5 lg:col-span-5 lg:gap-8">
          {contactItems.map(({ icon: Icon, value }) => (
            <div key={value} className="flex items-center gap-4">
              <Icon className="size-3.5 text-denim" strokeWidth={1.5} />
              <span className="text-sm text-navy/40">{value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4 lg:col-span-7">
          {footerSections.map((section) => (
            <section key={section.title} className="space-y-4">
              <h6 className="w-fit border-t border-navy/30 pt-2 text-xs font-medium tracking-200 text-navy">
                {section.title}
              </h6>
              <ul className="space-y-4">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="flex items-center gap-2 text-sm text-navy/40 transition-colors duration-300 hover:text-denim"
                      >
                        {Icon ? <Icon className="size-3.5" strokeWidth={1.5} /> : null}
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <div className="container relative z-10 mx-auto flex flex-col gap-4 px-4 md:flex-row lg:px-8">
        <p className="text-center text-xs text-navy/20">
          © {currentYear} {storeConfig.legalName}. Tum haklari saklidir.
        </p>
        <div className="flex flex-wrap gap-4 sm:gap-6">
          {policyLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs text-navy/20 transition-colors duration-300 hover:text-navy/40"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <ThemeToggle />
    </footer>
  );
}

