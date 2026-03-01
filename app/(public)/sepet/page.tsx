"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { Minus, Plus, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MobileBottomSummary } from "@/components/MobileBottomSummary";
import { getGuestSessionId } from "@/lib/guest-session";
import { storeConfig } from "@/lib/store-config";

function formatPrice(price: number) {
  return new Intl.NumberFormat(storeConfig.locale, {
    style: "currency",
    currency: storeConfig.currency,
  }).format(price);
}

export default function SepetPage() {
  const [statusMessage, setStatusMessage] = useState("");
  const guestSessionId = useMemo(
    () => (typeof window === "undefined" ? undefined : getGuestSessionId()),
    [],
  );

  const cart = useQuery(api.cart.getActive, { guestSessionId });
  const updateQuantity = useMutation(api.cart.updateItemQuantity);
  const removeItem = useMutation(api.cart.removeItem);
  const clearCart = useMutation(api.cart.clear);

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const shipping =
    items.length === 0
      ? 0
      : subtotal >= storeConfig.commerce.freeShippingThreshold
        ? 0
        : storeConfig.commerce.shippingFee;
  const total = subtotal + shipping;

  const canCheckout = useMemo(() => items.length > 0, [items.length]);

  async function onIncrease(productId: Id<"products">, currentQuantity: number) {
    setStatusMessage("");
    try {
      await updateQuantity({
        productId,
        quantity: currentQuantity + 1,
        guestSessionId,
      });
    } catch (error) {
      if (error instanceof Error) {
        setStatusMessage(error.message);
      } else {
        setStatusMessage("Miktar guncellenemedi");
      }
    }
  }

  async function onDecrease(productId: Id<"products">, currentQuantity: number) {
    setStatusMessage("");
    try {
      if (currentQuantity <= 1) {
        await removeItem({ productId, guestSessionId });
      } else {
        await updateQuantity({
          productId,
          quantity: currentQuantity - 1,
          guestSessionId,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        setStatusMessage(error.message);
      } else {
        setStatusMessage("Miktar guncellenemedi");
      }
    }
  }

  async function onRemove(productId: Id<"products">) {
    setStatusMessage("");
    try {
      await removeItem({ productId, guestSessionId });
    } catch (error) {
      if (error instanceof Error) {
        setStatusMessage(error.message);
      } else {
        setStatusMessage("Urun kaldirilamadi");
      }
    }
  }

  async function onClearCart() {
    setStatusMessage("");
    try {
      await clearCart({ guestSessionId });
      setStatusMessage("Sepet temizlendi");
    } catch (error) {
      if (error instanceof Error) {
        setStatusMessage(error.message);
      } else {
        setStatusMessage("Sepet temizlenemedi");
      }
    }
  }

  if (cart === undefined) {
    return (
      <div className="min-h-screen bg-paper pb-28 pt-16 text-navy sm:pt-20 lg:py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <h3 className="py-2">Sepetiniz</h3>
          <div className="border border-navy/10 p-8 text-center">
            <p className="text-sm text-navy/60">Yukleniyor</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper pb-28 pt-16 text-navy selection:bg-denim selection:text-background dark:selection:text-foreground sm:pt-20 lg:py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <h3 className="py-2">Sepetiniz</h3>

        {statusMessage ? <p className="mb-4 text-sm text-denim">{statusMessage}</p> : null}

        {items.length > 0 ? (
          <div className="relative flex flex-col gap-10 lg:flex-row lg:gap-16 xl:gap-24">
            <div className="w-full flex-1 animate-fade-up-delay-1">
              <div className="mb-6 flex items-center justify-between border-t border-navy/10 pt-4">
                <p className="text-sm text-navy/50">{items.length} urun</p>
                <Button type="button" variant="outlineGold" size="sm" onClick={() => void onClearCart()}>
                  Sepeti Temizle
                </Button>
              </div>

              <ul className="space-y-8">
                {items.map((item) => (
                  <li
                    key={item.productId}
                    className="group relative flex flex-col gap-5 border border-navy/10 p-4 sm:flex-row sm:gap-6 sm:border-0 sm:p-0 md:gap-8"
                  >
                    <div className="relative h-[250px] w-full shrink-0 overflow-hidden border border-navy/5 bg-paper sm:h-36 sm:w-28 md:h-48 md:w-36">
                      <div className="absolute inset-0 z-10 bg-linear-to-tr from-paper to-paper/40 opacity-20" />
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 112px, 144px"
                      />
                    </div>

                    <div className="flex min-h-36 flex-1 flex-col justify-between py-1 md:min-h-48">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="mb-1 uppercase tracking-wide transition-colors duration-300 group-hover:text-denim">
                            {item.name}
                          </h3>
                          <p className="text-sm font-light tracking-widest text-navy/50">Stok: {item.stock}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="h-8 w-8 p-0 text-navy/40 hover:text-destructive"
                          aria-label="Urunu sepetten cikar"
                          onClick={() => void onRemove(item.productId)}
                        >
                          <X className="size-5" strokeWidth={1.5} />
                        </Button>
                      </div>

                      <div className="mt-auto flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div className="inline-flex w-fit items-center border border-navy/20">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="h-8 w-8 rounded-none p-0 text-navy/60 hover:bg-navy/5 hover:text-navy"
                            aria-label="Azalt"
                            onClick={() => void onDecrease(item.productId, item.quantity)}
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="w-10 px-4 py-1.5 text-center text-sm font-medium text-navy">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="h-8 w-8 rounded-none p-0 text-navy/60 hover:bg-navy/5 hover:text-navy"
                            aria-label="Artir"
                            onClick={() => void onIncrease(item.productId, item.quantity)}
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-light tracking-wider text-navy md:text-xl">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mb-4 mt-8 border-t border-navy/10" />
            </div>

            <div className="hidden w-full shrink-0 animate-fade-up-delay-2 lg:block lg:w-[380px]">
              <div className="border border-navy/10 bg-paper/40 p-5 backdrop-blur-sm sm:p-8 lg:sticky lg:top-28">
                <h4 className="mb-6 uppercase tracking-widest">Siparis Ozeti</h4>

                <div className="space-y-4 text-sm font-light tracking-wider">
                  <div className="flex justify-between text-navy/70">
                    <span>Ara Toplam</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-navy/70">
                    <span>Kargo</span>
                    <span>{shipping === 0 ? "Ucretsiz" : formatPrice(shipping)}</span>
                  </div>
                </div>

                <div className="my-6">
                  <Separator className="bg-navy/10" />
                </div>

                <div className="mb-8 flex items-end justify-between">
                  <span className="text-sm font-semibold uppercase tracking-widest text-navy">Toplam</span>
                  <span className="font-heading text-2xl tracking-wide text-denim">{formatPrice(total)}</span>
                </div>

                <Button
                  asChild
                  className="h-14 w-full rounded-none bg-denim text-sm font-semibold uppercase tracking-200 text-background dark:text-foreground transition-all duration-300 hover:bg-denim-hover"
                  disabled={!canCheckout}
                >
                  <Link href="/odeme">Guvenli Odeme</Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-up-delay-1 py-24 text-center">
            <p className="mb-8 font-light uppercase tracking-widest text-navy/50">Sepetiniz bos</p>
            <Button
              asChild
              variant="outline"
              className="rounded-none border-navy/20 px-8 py-6 font-semibold tracking-200 text-navy hover:bg-navy hover:text-background dark:hover:text-foreground"
            >
              <Link href="/#collections">Urunleri Gor</Link>
            </Button>
          </div>
        )}
      </div>

      {items.length > 0 ? (
        <MobileBottomSummary
          summary={
            <>
              <h4 className="mb-3 border-b border-navy/10 pb-2 text-xs uppercase tracking-widest">Siparis Ozeti</h4>
              <div className="space-y-2 text-xs font-light tracking-wide">
                <div className="flex justify-between text-navy/70">
                  <span>Ara Toplam</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-navy/70">
                  <span>Kargo</span>
                  <span>{shipping === 0 ? "Ucretsiz" : formatPrice(shipping)}</span>
                </div>
              </div>
              <Separator className="my-4 bg-navy/10" />
              <div className="flex items-end justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-navy">Toplam</span>
                <span className="font-heading text-xl tracking-wide text-denim">{formatPrice(total)}</span>
              </div>
            </>
          }
          totalValue={formatPrice(total)}
          action={
            <Button asChild className="h-13 shrink-0 bg-denim px-4 text-xs uppercase tracking-widest text-background dark:text-foreground hover:bg-denim-hover">
              <Link href="/odeme">Odemeye Gec</Link>
            </Button>
          }
        />
      ) : null}
    </div>
  );
}
