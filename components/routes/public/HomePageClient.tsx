"use client";

import { useMemo, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { ArrowRight, Heart, RotateCcw, Search, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { storeConfig } from "@/lib/store-config";

const trustItems = [
  { title: "Ayni Gun Kargo", icon: Truck },
  { title: "14 Gun Iade", icon: RotateCcw },
  { title: "Guvenli Odeme", icon: ShieldCheck },
];

const priceTabs = ["Tumu", "0-500", "500-1000", "1000+"];
const sortTabs = ["One Cikan", "Fiyat Artan", "Fiyat Azalan"];

function formatPrice(price: number) {
  return new Intl.NumberFormat(storeConfig.locale, {
    style: "currency",
    currency: storeConfig.currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function inPriceRange(price: number, range: string) {
  if (range === "Tumu") {
    return true;
  }

  if (range === "0-500") {
    return price <= 500;
  }

  if (range === "500-1000") {
    return price > 500 && price <= 1000;
  }

  return price > 1000;
}

type HomePageClientProps = {
  preloadedProducts: Preloaded<typeof api.catalog.listPublicProducts>;
  preloadedCategories: Preloaded<typeof api.catalog.listPublicCategories>;
};

export default function HomePageClient({
  preloadedProducts,
  preloadedCategories,
}: HomePageClientProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tumu");
  const [priceRange, setPriceRange] = useState("Tumu");
  const [sortType, setSortType] = useState("One Cikan");

  const products = usePreloadedQuery(preloadedProducts);
  const categories = usePreloadedQuery(preloadedCategories);
  const addItem = useMutation(api.cart.addItem);
  const categoryTabs = useMemo(
    () => ["Tumu", ...categories.map((item) => item.name)],
    [categories],
  );

  const promoCards = useMemo(() => {
    const selected = [products[4], products[2]].filter((product) => Boolean(product));

    return selected.map((product, index) => ({
      title: index === 0 ? "Yeni Gelenler" : "Haftanin Secimi",
      href: index === 0 ? "#collections" : `/urun/${product._id}`,
      product,
    }));
  }, [products]);

  const catalog = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchQuery = product.name.toLowerCase().includes(query.toLowerCase());
      const matchCategory = category === "Tumu" || product.categoryName === category;
      const matchPrice = inPriceRange(product.price, priceRange);

      return matchQuery && matchCategory && matchPrice;
    });

    if (sortType === "Fiyat Artan") {
      return [...filtered].sort((a, b) => a.price - b.price);
    }

    if (sortType === "Fiyat Azalan") {
      return [...filtered].sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [category, priceRange, products, query, sortType]);

  const heroProduct = products[0];

  async function onAddToCart(
    productId: Id<"products">,
    variantId?: Id<"productVariants"> | null,
  ) {
    try {
      await addItem({
        productId,
        variantId: variantId ?? undefined,
        quantity: 1,
      });
      toast.success("Urun sepete eklendi");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Sepete eklenemedi");
      }
    }
  }

  return (
    <main className="bg-paper pb-12 text-navy sm:pb-16">
      <section className="border-b border-navy/10 pt-28 sm:pt-32">
        <div className="container mx-auto px-4 pb-8 sm:pb-10">
          <div className="flex flex-col gap-2 border border-navy/10 bg-navy px-4 py-3 text-xs tracking-wide text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>Secili urunlerde kampanya</p>
            <Button asChild size="sm" className="h-8 w-full sm:w-auto">
              <Link href="#collections">Alisverise Basla</Link>
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
            {heroProduct ? (
              <Link
                href={`/urun/${heroProduct._id}`}
                className="group overflow-hidden border border-navy/10 bg-paper lg:col-span-8"
              >
                <div className="relative h-72 sm:h-80 lg:h-96">
                  <Image
                    src={heroProduct.image}
                    alt={heroProduct.name}
                    fill
                    sizes="(max-width: 1023px) 100vw, 66vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-navy/35 via-navy/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-background dark:text-foreground sm:p-6">
                    <h1 className="text-background dark:text-foreground">Ozel Secimler</h1>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex h-72 items-end border border-navy/10 bg-paper p-5 sm:h-80 lg:col-span-8 lg:h-96">
                <h1>Urun eklenmedi</h1>
              </div>
            )}

            <div id="about" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:col-span-4">
              {promoCards.length > 0 ? (
                promoCards.map((card) => (
                  <Link key={card.title} href={card.href} className="group overflow-hidden border border-navy/10 bg-paper">
                    <div className="relative h-40 sm:h-44 lg:h-48">
                      <Image
                        src={card.product.image}
                        alt={card.title}
                        fill
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-linear-to-r from-navy/30 to-transparent" />
                      <div className="absolute inset-0 flex items-end p-4 text-background dark:text-foreground">
                        <div className="flex items-center gap-2">
                          <h3 className="text-background dark:text-foreground">{card.title}</h3>
                          <ArrowRight className="size-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex h-40 items-center border border-navy/10 bg-paper p-4 sm:h-44 lg:h-48">
                  <p className="text-sm text-navy/60">Vitrin kartlari icin urun ekleyin</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-navy/10 py-5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {trustItems.map((item) => (
              <div key={item.title} className="flex items-center gap-3 border border-navy/10 bg-paper p-3">
                <item.icon className="size-4 text-denim" />
                <p className="text-sm">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="collections" className="py-8 sm:py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-3 border border-navy/10 bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
            <h2>Urunler</h2>
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy/40" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Urun ara"
                className="h-10 border-navy/20 bg-paper pl-10 text-sm text-navy placeholder:text-navy/40 focus-visible:border-denim focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:mt-4">
            <div className="flex flex-wrap gap-2">
              {categoryTabs.map((tab) => (
                <Button
                  key={tab}
                  type="button"
                  size="sm"
                  variant={category === tab ? "default" : "outlineGold"}
                  onClick={() => setCategory(tab)}
                >
                  {tab}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {priceTabs.map((tab) => (
                <Button
                  key={tab}
                  type="button"
                  size="sm"
                  variant={priceRange === tab ? "default" : "outlineGold"}
                  onClick={() => setPriceRange(tab)}
                >
                  {tab}
                </Button>
              ))}

              {sortTabs.map((tab) => (
                <Button
                  key={tab}
                  type="button"
                  size="sm"
                  variant={sortType === tab ? "default" : "outlineGold"}
                  onClick={() => setSortType(tab)}
                >
                  {tab}
                </Button>
              ))}
            </div>
          </div>

          {catalog.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {catalog.map((product) => (
                <article key={product._id} className="flex flex-col border border-navy/10 bg-paper">
                  <Link href={`/urun/${product._id}`} className="group relative block h-64 overflow-hidden sm:h-72">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute right-3 top-3 flex size-8 items-center justify-center border border-paper/60 bg-paper/80 text-navy">
                      <Heart className="size-4" />
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <h3 className="text-base">{product.name}</h3>
                    <p className="text-sm text-navy/60">{product.categoryName}</p>
                    <p className="text-base text-denim">{formatPrice(product.price)}</p>
                    <div className="mt-auto flex gap-2">
                      <Button asChild size="sm" variant="outlineGold" className="flex-1">
                        <Link href={`/urun/${product._id}`}>Incele</Link>
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          void onAddToCart(product._id, product.defaultVariantId)
                        }
                      >
                        Sepete Ekle
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 border border-navy/10 bg-paper p-8 text-center">
              <p className="text-sm text-navy/60">Katalog bos. Urunlerinizi yonetim panelinden ekleyin.</p>
            </div>
          )}
        </div>
      </section>

      <section id="testimonials" className="border-t border-navy/10 pt-8 sm:pt-10">
        <div className="container mx-auto px-4">
          <h2>Musteri Secimleri</h2>
          {products.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 3).map((product) => (
                <Link key={`pick-${product._id}`} href={`/urun/${product._id}`} className="group overflow-hidden border border-navy/10 bg-paper">
                  <div className="relative h-56">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                  <div className="border-t border-navy/10 p-4">
                    <h3 className="text-base">{product.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4 border border-navy/10 bg-paper p-8 text-center">
              <p className="text-sm text-navy/60">Musteri secimleri bolumu icin urun bulunamadi.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
