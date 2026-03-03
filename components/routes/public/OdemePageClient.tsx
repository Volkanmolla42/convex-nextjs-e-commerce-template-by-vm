"use client";

import { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { ChevronRight, CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileBottomSummary } from "@/components/MobileBottomSummary";
import { storeConfig } from "@/lib/store-config";

function formatPrice(price: number) {
  return new Intl.NumberFormat(storeConfig.locale, {
    style: "currency",
    currency: storeConfig.currency,
  }).format(price);
}

type OdemePageClientProps = {
  preloadedCart: Preloaded<typeof api.cart.getActive>;
};

type OrderSummaryItem = {
  cartItemId: Id<"cartItems">;
  image: string;
  name: string;
  variantLabel?: string | null;
  price: number;
  quantity: number;
};

function OrderSummary({
  items,
  subtotal,
  shipping,
}: {
  items: OrderSummaryItem[];
  subtotal: number;
  shipping: number;
}) {
  return (
    <>
      <h4 className="mb-3 border-b border-navy/10 pb-2 text-xs uppercase tracking-widest lg:mb-4 lg:pb-3 lg:text-sm">
        Siparis Ozeti
      </h4>

      <ul className="space-y-3 lg:space-y-5">
        {items.map((item) => (
          <li key={item.cartItemId} className="flex items-start gap-3">
            <div className="relative h-14 w-12 shrink-0 border border-navy/10 bg-paper lg:h-20 lg:w-16">
              <div className="absolute -right-2 -top-2 z-20 flex size-4 items-center justify-center rounded-full bg-navy/20 text-xs font-bold backdrop-blur-md lg:size-5">
                {item.quantity}
              </div>
              <Image src={item.image} alt={item.name} fill className="object-cover opacity-80" sizes="64px" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="mb-1 truncate text-xs uppercase tracking-wide lg:text-sm">{item.name}</h3>
              {item.variantLabel ? (
                <p className="text-xs text-navy/60">{item.variantLabel}</p>
              ) : null}
              <p className="text-xs tracking-widest text-navy/50">{formatPrice(item.price)}</p>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-xs tracking-wide lg:text-sm">{formatPrice(item.price * item.quantity)}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="space-y-2 pt-4 text-xs font-light tracking-wide lg:space-y-4 lg:pt-6 lg:text-sm lg:tracking-wider">
        <div className="flex justify-between text-navy/70">
          <span>Ara Toplam</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-navy/70">
          <span>Kargo</span>
          <span>{shipping === 0 ? "Ucretsiz" : formatPrice(shipping)}</span>
        </div>
      </div>
    </>
  );
}

export default function OdemePageClient({ preloadedCart }: OdemePageClientProps) {
  const router = useRouter();
  const cart = usePreloadedQuery(preloadedCart);
  const createOrder = useMutation(api.orders.createFromActiveCart);

  const items = cart.items.filter((item): item is NonNullable<typeof item> => item !== null);
  const subtotal = cart.subtotal;
  const shipping = cart.shippingFee;
  const total = cart.payableTotal;

  const inputClasses =
    "h-12 w-full rounded-none border-navy/20 bg-transparent font-light tracking-wide text-navy placeholder:text-navy/40 focus-visible:border-denim focus-visible:ring-1 focus-visible:ring-denim transition-colors";
  const labelClasses = "mb-2 block text-xs uppercase tracking-widest text-navy/60";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    try {
      const result = await createOrder({
        customerName: String(formData.get("customerName") || ""),
        customerPhone: String(formData.get("customerPhone") || ""),
        customerCity: String(formData.get("customerCity") || ""),
        customerProvince: String(formData.get("customerProvince") || ""),
        customerAddress: String(formData.get("customerAddress") || ""),
        customerApartment: String(formData.get("customerApartment") || "") || undefined,
      });

      toast.success(`Siparis olusturuldu: ${result.orderId}`);
      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Siparis olusturulamadi");
      }
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4 text-navy">
        <div className="w-full max-w-md border border-navy/10 bg-paper p-8 text-center">
          <h1>Odeme yapilacak urun yok</h1>
          <div className="mt-4">
            <Button asChild>
              <Link href="/sepet">Sepete Don</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper pb-28 pt-8 text-navy selection:bg-denim selection:text-background dark:selection:text-foreground sm:pt-10 lg:pb-20">
      <div className="container mx-auto flex w-full max-w-7xl flex-1 flex-col px-4">
        <div className="relative flex flex-col gap-10 lg:flex-row lg:gap-16 xl:gap-24">
          <div className="w-full max-w-none flex-1 animate-fade-up-delay-1 lg:max-w-2xl">
            <h1 className="mb-8">Odeme ve Teslimat</h1>

            <form id="odeme-form" className="space-y-10 sm:space-y-12" onSubmit={(event) => void onSubmit(event)}>
              <section className="space-y-6">
                <h4 className="border-b border-navy/10 pb-4 uppercase tracking-widest">Teslimat Adresi</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label htmlFor="customerName" className={labelClasses}>
                      Ad Soyad *
                    </Label>
                    <Input type="text" id="customerName" name="customerName" className={inputClasses} required />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="customerAddress" className={labelClasses}>
                      Adres *
                    </Label>
                    <Input
                      type="text"
                      id="customerAddress"
                      name="customerAddress"
                      className={inputClasses}
                      placeholder="Mahalle, Sokak, Bina No"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="customerApartment" className={labelClasses}>
                      Daire, Kat vb.
                    </Label>
                    <Input type="text" id="customerApartment" name="customerApartment" className={inputClasses} />
                  </div>
                  <div>
                    <Label htmlFor="customerCity" className={labelClasses}>
                      Ilce *
                    </Label>
                    <Input type="text" id="customerCity" name="customerCity" className={inputClasses} required />
                  </div>
                  <div>
                    <Label htmlFor="customerProvince" className={labelClasses}>
                      Il *
                    </Label>
                    <Input type="text" id="customerProvince" name="customerProvince" className={inputClasses} required />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="customerPhone" className={labelClasses}>
                      Telefon *
                    </Label>
                    <Input
                      type="tel"
                      id="customerPhone"
                      name="customerPhone"
                      className={inputClasses}
                      placeholder="0555 555 55 55"
                      required
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="border-b border-navy/10 pb-4 uppercase tracking-widest">Odeme</h4>

                <div className="space-y-6 border border-navy/20 bg-paper/50 p-4 sm:p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <CreditCard className="size-5 text-denim" />
                    <span className="text-sm uppercase tracking-widest">Kredi / Banka Karti</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber" className={labelClasses}>
                        Kart Numarasi
                      </Label>
                      <div className="relative">
                        <Input type="text" id="cardNumber" className={inputClasses} placeholder="0000 0000 0000 0000" maxLength={19} />
                        <Lock className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-navy/30" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry" className={labelClasses}>
                          Son Kullanma Tarihi
                        </Label>
                        <Input type="text" id="expiry" className={inputClasses} placeholder="AA/YY" maxLength={5} />
                      </div>
                      <div>
                        <Label htmlFor="cvv" className={labelClasses}>
                          Guvenlik Kodu
                        </Label>
                        <Input type="text" id="cvv" className={inputClasses} placeholder="CVV" maxLength={4} />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="nameOnCard" className={labelClasses}>
                        Kart Uzerindeki Isim
                      </Label>
                      <Input type="text" id="nameOnCard" className={inputClasses} />
                    </div>
                  </div>
                </div>
              </section>

              <div className="pt-6">
                <Button
                  type="submit"
                  className="group hidden h-12 w-full bg-denim text-sm uppercase tracking-160 text-background dark:text-foreground transition-all duration-300 hover:bg-denim-hover sm:h-14 sm:text-base sm:tracking-200 lg:flex"
                >
                  Siparisi Onayla
                  <ChevronRight className="ml-2 size-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </div>
            </form>
          </div>

          <div className="hidden w-full shrink-0 animate-fade-up-delay-2 lg:block lg:w-[420px]">
            <div className="border border-navy/10 bg-paper/40 p-5 backdrop-blur-sm sm:p-8 lg:sticky lg:top-28">
              <OrderSummary items={items} subtotal={subtotal} shipping={shipping} />
            </div>
          </div>
        </div>
      </div>

      <MobileBottomSummary
        summary={<OrderSummary items={items} subtotal={subtotal} shipping={shipping} />}
        totalValue={formatPrice(total)}
        action={
          <Button
            type="submit"
            form="odeme-form"
            className="h-13 shrink-0 bg-denim px-4 text-xs uppercase tracking-widest text-background dark:text-foreground hover:bg-denim-hover"
          >
            Odeme Yap
          </Button>
        }
      />
    </div>
  );
}
