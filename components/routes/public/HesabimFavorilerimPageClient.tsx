"use client";

import Image from "next/image";
import Link from "next/link";
import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { Heart, X } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { storeConfig } from "@/lib/store-config";

function formatPrice(price: number) {
  return new Intl.NumberFormat(storeConfig.locale, {
    style: "currency",
    currency: storeConfig.currency,
    maximumFractionDigits: 0,
  }).format(price);
}

type HesabimFavorilerimPageClientProps = {
  preloadedWishlist: Preloaded<typeof api.wishlist.listMine>;
};

export default function HesabimFavorilerimPageClient({
  preloadedWishlist,
}: HesabimFavorilerimPageClientProps) {
  const wishlist = usePreloadedQuery(preloadedWishlist);
  const toggleWishlist = useMutation(api.wishlist.toggle);
  const addToCart = useMutation(api.cart.addItem);

  async function onRemove(productId: Id<"products">) {
    try {
      await toggleWishlist({ productId });
      toast.success("Favorilerden kaldirildi");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Favorilerden kaldirilamadi");
      }
    }
  }

  async function onAddToCart(productId: Id<"products">) {
    try {
      await addToCart({ productId, quantity: 1 });
      toast.success("Sepete eklendi");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Sepete eklenemedi");
      }
    }
  }

  return (
    <section className="space-y-4">
      <h2>Favorilerim</h2>
      {wishlist.length === 0 ? (
        <div className="border border-border p-8 text-center">
          <Heart className="mx-auto mb-3 size-12 text-navy/20" />
          <p className="mb-4 text-navy/60">Favori urun yok</p>
          <Button asChild variant="outlineGold">
            <Link href="/#collections">Urunleri Gor</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <article key={item.wishlistId} className="group relative flex flex-col border border-navy/10 bg-paper">
              <Link href={`/urun/${item.productId}`} className="relative block h-64 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.productName}
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              </Link>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute right-2 top-2 size-8 border border-paper/60 bg-paper/80 text-destructive hover:bg-destructive hover:text-background dark:hover:text-foreground"
                onClick={() => void onRemove(item.productId)}
              >
                <X className="size-4" />
              </Button>

              <div className="flex flex-1 flex-col gap-3 p-4">
                <h3 className="text-base">{item.productName}</h3>
                <p className="text-base text-denim">{formatPrice(item.price)}</p>
                <div className="mt-auto flex gap-2">
                  <Button asChild size="sm" variant="outlineGold" className="flex-1">
                    <Link href={`/urun/${item.productId}`}>Incele</Link>
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => void onAddToCart(item.productId)}
                  >
                    Sepete Ekle
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
