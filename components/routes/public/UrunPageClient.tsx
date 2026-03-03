"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { storeConfig } from "@/lib/store-config";

function formatPrice(price: number) {
  return new Intl.NumberFormat(storeConfig.locale, {
    style: "currency",
    currency: storeConfig.currency,
    maximumFractionDigits: 0,
  }).format(price);
}

type UrunPageClientProps = {
  preloadedProduct: Preloaded<typeof api.catalog.getPublicProductById>;
  preloadedProducts: Preloaded<typeof api.catalog.listPublicProducts>;
};

export default function UrunPageClient({
  preloadedProduct,
  preloadedProducts,
}: UrunPageClientProps) {
  const product = usePreloadedQuery(preloadedProduct);
  const products = usePreloadedQuery(preloadedProducts);
  const [selectedVariantId, setSelectedVariantId] = useState<Id<"productVariants"> | null>(
    null,
  );
  const addItem = useMutation(api.cart.addItem);
  const variants = useMemo(() => product?.variants ?? [], [product]);

  const suggestedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return products.filter((item) => item._id !== product._id).slice(0, 3);
  }, [product, products]);

  if (product === null) {
    return (
      <main className="container mx-auto px-4 py-24 text-center">
        <h1>Urun bulunamadi</h1>
        <div className="mt-4">
          <Button asChild>
            <Link href="/">Ana Sayfaya Don</Link>
          </Button>
        </div>
      </main>
    );
  }

  const selectedVariant =
    variants.find((variant) => variant._id === selectedVariantId) ?? variants[0] ?? null;

  if (!selectedVariant) {
    return (
      <main className="container mx-auto px-4 py-24 text-center">
        <h1>Urun varyanti bulunamadi</h1>
      </main>
    );
  }

  const displayPrice = selectedVariant.price;
  const availableStock = selectedVariant.stock;

  async function onAddToCart() {
    if (!product) {
      return;
    }

    if (selectedVariant.stock <= 0) {
      toast.error("Secilen varyantta stok yok");
      return;
    }

    try {
      await addItem({
        productId: product._id,
        variantId: selectedVariant._id,
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
    <>
      <main className="container mx-auto px-4 py-16 sm:py-20 lg:px-8 lg:py-24">
        <div className="mb-8 flex flex-wrap text-[10px] uppercase tracking-200 text-navy/40 sm:mb-12">
          <Link href="/" className="transition-colors hover:text-denim">
            Ana Sayfa
          </Link>
          <span className="mx-2">/</span>
          <Link href="/#collections" className="transition-colors hover:text-denim">
            {product.categoryName}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-navy">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col-reverse gap-4 sm:gap-6 md:flex-row lg:col-span-7">
            <div className="no-scrollbar flex w-full shrink-0 gap-3 overflow-x-auto md:w-24 md:flex-col md:gap-4 md:overflow-visible">
              {variants.map((variant) => (
                <Button
                  type="button"
                  key={variant._id}
                  onClick={() => setSelectedVariantId(variant._id)}
                  variant="outline"
                  className={cn(
                    "relative h-24 w-20 shrink-0 overflow-hidden p-0 md:h-28 md:w-full lg:h-32",
                    selectedVariant._id === variant._id
                      ? "border-denim"
                      : "border-navy/10 opacity-60 hover:opacity-100",
                  )}
                >
                  <Image
                    src={variant.image}
                    alt={`${product.name} ${variant.label}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized
                  />
                </Button>
              ))}
            </div>

            <div className="group relative h-[430px] w-full overflow-hidden sm:h-[520px] md:h-[680px] lg:h-[800px]">
              <Image
                src={selectedVariant.image}
                alt={product.name}
                fill
                sizes="(max-width: 767px) 100vw, (max-width: 1023px) 70vw, 58vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
            </div>
          </div>

          <div className="flex flex-col justify-start lg:col-span-5">
            <h1 className="mb-3 sm:mb-4">{product.name}</h1>
            <p className="mb-2 text-lg font-light text-denim sm:text-xl">{formatPrice(displayPrice)}</p>
            <p className="mb-6 text-sm text-navy/60 sm:mb-8">Stok: {availableStock}</p>

            <div className="mb-6 h-px w-12 bg-navy/20 sm:mb-8" />

            <p className="mb-8 text-sm leading-relaxed text-navy/60 sm:mb-10">{product.description}</p>

            <div className="mb-10">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-200 text-navy/60">Varyant</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {variants.map((variant) => (
                  <Button
                    type="button"
                    key={variant._id}
                    onClick={() => setSelectedVariantId(variant._id)}
                    variant="outline"
                    className={cn(
                      "h-12 w-full justify-between px-3 text-xs",
                      selectedVariant._id === variant._id
                        ? "border-denim text-denim hover:border-denim hover:text-denim"
                        : "border-navy/20 text-navy/60 hover:border-navy hover:text-navy",
                    )}
                  >
                    <span className="truncate">{variant.label}</span>
                    <span>{formatPrice(variant.price)}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Button
              className="h-12 w-full gap-2 tracking-180 sm:h-16 sm:gap-3 sm:tracking-250"
              onClick={() => void onAddToCart()}
              disabled={availableStock <= 0}
            >
              Sepete Ekle
            </Button>
          </div>
        </div>
      </main>

      <section className="border-t border-navy/10 bg-paper py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-10 text-center md:mb-12 md:text-left">
            <h2 className="mb-4">Gorunumu Tamamla</h2>
            <div className="mx-auto h-[2px] w-12 bg-denim md:mx-0" />
          </div>

          {suggestedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
              {suggestedProducts.map((item) => (
                <Link key={item._id} href={`/urun/${item._id}`} className="group block">
                  <div className="relative mb-4 h-[320px] overflow-hidden sm:mb-6 sm:h-[400px]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 767px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 transition-colors duration-500 group-hover:bg-paper/10" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <h3 className="uppercase tracking-wide">{item.name}</h3>
                    <p className="font-light text-denim">{formatPrice(item.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-navy/10 bg-paper p-8 text-center">
              <p className="text-sm text-navy/60">Onerilen urun bulunamadi.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
