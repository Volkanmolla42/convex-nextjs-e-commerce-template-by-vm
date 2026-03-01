"use client";

import { Suspense, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getGuestSessionId } from "@/lib/guest-session";
import { storeConfig } from "@/lib/store-config";

function formatPrice(price: number) {
  return new Intl.NumberFormat(storeConfig.locale, {
    style: "currency",
    currency: storeConfig.currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function ProductContent() {
  const searchParams = useSearchParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [cartStatus, setCartStatus] = useState("");
  const guestSessionId = useMemo(
    () => (typeof window === "undefined" ? undefined : getGuestSessionId()),
    [],
  );

  const productId = searchParams.get("id");
  const parsedProductId = productId as Id<"products"> | null;

  const product = useQuery(
    api.products.getById,
    parsedProductId ? { productId: parsedProductId } : "skip",
  );
  const rawProducts = useQuery(api.products.listPublic);
  const products = useMemo(() => rawProducts ?? [], [rawProducts]);
  const addItem = useMutation(api.cart.addItem);

  const suggestedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return products.filter((item) => item._id !== product._id).slice(0, 3);
  }, [product, products]);

  if (!productId || product === null) {
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

  if (!product) {
    return (
      <main className="container mx-auto px-4 py-24 text-center">
        <h1>Yukleniyor</h1>
      </main>
    );
  }

  const images = [product.image];

  const infoItems = [
    { title: "Detaylar", content: product.details },
    { title: "Bakim Talimatlari", content: product.careInstructions },
    {
      title: "Kargo ve Iade",
      content:
        "Tum siparislerde hizli teslimat sunulur. Teslimattan sonra 14 gun icinde iade yapilabilir.",
    },
  ];

  async function onAddToCart() {
    if (!product) {
      return;
    }

    setCartStatus("");
    try {
      await addItem({
        productId: product._id,
        quantity: 1,
        guestSessionId,
      });
      setCartStatus("Urun sepete eklendi");
      setTimeout(() => setCartStatus(""), 2000);
    } catch (error) {
      if (error instanceof Error) {
        setCartStatus(error.message);
      } else {
        setCartStatus("Sepete eklenemedi");
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
              {images.map((image, index) => (
                <Button
                  type="button"
                  key={image}
                  onClick={() => setSelectedImage(index)}
                  variant="outline"
                  className={cn(
                    "relative h-24 w-20 shrink-0 overflow-hidden p-0 md:h-28 md:w-full lg:h-32",
                    selectedImage === index ? "border-denim" : "border-navy/10 opacity-60 hover:opacity-100",
                  )}
                >
                  <Image src={image} alt={`Kucuk gorsel ${index + 1}`} fill className="object-cover" unoptimized />
                </Button>
              ))}
            </div>

            <div className="group relative h-[430px] w-full overflow-hidden sm:h-[520px] md:h-[680px] lg:h-[800px]">
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
            </div>
          </div>

          <div className="flex flex-col justify-start lg:col-span-5">
            <h1 className="mb-3 sm:mb-4">{product.name}</h1>
            <p className="mb-6 text-lg font-light text-denim sm:mb-8 sm:text-xl">{formatPrice(product.price)}</p>

            <div className="mb-6 h-px w-12 bg-navy/20 sm:mb-8" />

            <p className="mb-8 text-sm leading-relaxed text-navy/60 sm:mb-10">{product.description}</p>

            <div className="mb-10">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-200 text-navy/60">Beden</span>
                <Button type="button" variant="link" className="text-[10px]">
                  Beden Rehberi
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {["S", "M", "L"].map((size) => (
                  <Button
                    type="button"
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    variant="outline"
                    className={cn(
                      "h-12 w-full tracking-widest",
                      selectedSize === size
                        ? "border-denim text-denim hover:border-denim hover:text-denim"
                        : "border-navy/20 text-navy/60 hover:border-navy hover:text-navy",
                    )}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <Button className="h-12 w-full gap-2 tracking-180 sm:h-16 sm:gap-3 sm:tracking-250" onClick={() => void onAddToCart()}>
              Sepete Ekle
            </Button>
            {cartStatus ? <p className="mt-3 text-sm text-denim">{cartStatus}</p> : null}

            <div className="mt-10 divide-y divide-navy/10 border-t border-navy/10 sm:mt-16">
              {infoItems.map((item) => (
                <div key={item.title} className="py-5 sm:py-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-150 text-navy/80">
                    {item.title}
                    <span className="text-base text-denim">•</span>
                  </div>
                  <div className="mt-3 text-xs leading-relaxed text-navy/50 sm:mt-4">{item.content}</div>
                </div>
              ))}
            </div>
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
                <Link key={item._id} href={`/urun?id=${item._id}`} className="group block">
                  <div className="relative mb-4 h-[320px] overflow-hidden sm:mb-6 sm:h-[400px]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
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

export default function UrunPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper text-xs uppercase tracking-widest text-denim">
          Yukleniyor...
        </div>
      }
    >
      <ProductContent />
    </Suspense>
  );
}
