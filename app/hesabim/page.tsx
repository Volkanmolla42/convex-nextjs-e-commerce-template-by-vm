"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Heart, LogOut, MapPin, Pencil, Settings, ShoppingBag } from "lucide-react";
import { storeConfig } from "@/lib/store-config";

function formatPrice(value: number) {
  return new Intl.NumberFormat(storeConfig.locale, {
    style: "currency",
    currency: storeConfig.currency,
  }).format(value);
}

export default function HesabimPage() {
  const user = useQuery(api.userFunctions.currentUser);
  const orders = useQuery(api.orders.listMine);
  const updateProfile = useMutation(api.userFunctions.updateProfile);
  const { signOut } = useAuthActions();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user === null) {
      router.push("/giris");
    }
  }, [user, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() || undefined });
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (user === undefined || orders === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border border-denim border-t-transparent animate-spin" />
          <p className="text-navy/40 text-xs tracking-300 uppercase">Yukleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = (user.name || user.email || "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <section className="relative py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute right-0 top-16 h-[320px] w-[320px] bg-denim/2 blur-[100px] sm:top-20 sm:h-[600px] sm:w-[600px] sm:blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-[240px] w-[240px] bg-denim/1.5 blur-[80px] sm:h-[400px] sm:w-[400px] sm:blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="w-max py-4">
            <h3>Hesabim</h3>
            <div className="w-full h-[2px] bg-denim" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3 lg:gap-12">
            <div
              className={`lg:col-span-1 transition-all duration-700 delay-200 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="relative border border-navy/10 p-6 transition-colors duration-500 group hover:border-navy/20 hover-denim-corners sm:p-8 md:p-10">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6 flex h-20 w-20 items-center justify-center overflow-hidden border border-denim/30 bg-denim/10 group/avatar sm:h-24 sm:w-24">
                    <span className="text-denim text-xl tracking-wider font-heading sm:text-2xl">
                      {initials}
                    </span>
                    <div className="absolute inset-0 bg-denim/5 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" />
                  </div>

                  <h2 className="font-light tracking-wide mb-1">{user.name || "Isimsiz Kullanici"}</h2>
                  <p className="text-navy/40 text-sm mb-6">{user.email}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  type="button"
                  onClick={() => void handleSignOut()}
                  variant="danger"
                  className="group h-12 w-full justify-between px-5 sm:h-auto sm:px-6 sm:py-4"
                >
                  <span>Cikis Yap</span>
                  <LogOut className="size-4 transform group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
                </Button>
              </div>
            </div>

            <div
              className={`lg:col-span-2 transition-all duration-700 delay-300 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {success ? (
                <div className="mb-6 flex items-center gap-3 border border-denim/30 bg-denim/5 px-4 py-3 animate-fade-up sm:mb-8 sm:px-6 sm:py-4">
                  <Check className="size-4 text-denim shrink-0" strokeWidth={2} />
                  <p className="text-denim text-sm">Profiliniz basariyla guncellendi.</p>
                </div>
              ) : null}

              <div className="border border-navy/10 relative group hover:border-navy/20 transition-colors duration-500 hover-denim-corners">
                <div className="flex flex-col items-start justify-between gap-4 border-b border-navy/10 px-4 py-5 sm:flex-row sm:items-center sm:px-6 sm:py-6 md:px-8">
                  <div>
                    <p className="text-denim text-xs tracking-300 uppercase mb-1">PROFIL</p>
                    <h3 className="font-light">Kisisel Bilgiler</h3>
                  </div>
                  <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
                    {isEditing && name !== (user.name || "") ? (
                      <Button
                        type="button"
                        onClick={() => void handleSave()}
                        disabled={saving}
                        size="sm"
                        className="h-10 flex-1 gap-2 sm:h-auto sm:flex-none"
                      >
                        {saving ? "Kaydediliyor..." : "Kaydet"}
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      onClick={() => {
                        if (isEditing) {
                          setIsEditing(false);
                          setName(user.name || "");
                        } else {
                          setIsEditing(true);
                          setName(user.name || "");
                        }
                      }}
                      variant={isEditing ? "outline" : "outlineGold"}
                      size="sm"
                      className="h-10 flex-1 gap-2 sm:h-auto sm:flex-none"
                    >
                      {!isEditing ? <Pencil className="size-3.5" strokeWidth={1.5} /> : null}
                      {isEditing ? "Iptal" : "Duzenle"}
                    </Button>
                  </div>
                </div>

                <div className="p-4 sm:p-6 md:p-8">
                  <div className="space-y-6 sm:space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
                      <div className="md:w-1/3">
                        <label className="text-navy/40 text-xs tracking-200 uppercase">Ad Soyad</label>
                      </div>
                      <div className="md:w-2/3">
                        {isEditing ? (
                          <Input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="h-10 w-full rounded-none border-0 border-b border-navy/20 bg-transparent px-0 pb-3 text-base text-navy placeholder:text-navy/20 focus-visible:border-denim focus-visible:ring-0"
                            placeholder="Adinizi girin"
                          />
                        ) : (
                          <p className="text-navy text-base pb-3 border-b border-transparent">
                            {user.name || <span className="text-navy/30 italic">Belirtilmemis</span>}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
                      <div className="md:w-1/3">
                        <label className="text-navy/40 text-xs tracking-200 uppercase">E-posta</label>
                      </div>
                      <div className="md:w-2/3">
                        <p className="text-navy/60 text-base pb-3 border-b border-transparent flex items-center gap-2">
                          {user.email}
                          <span className="text-navy/20 text-xs tracking-150 uppercase">(degistirilemez)</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2">
                <div className="relative border border-navy/10 p-5 transition-colors duration-500 group hover:border-navy/20 hover-denim-corners sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-denim/10 flex items-center justify-center shrink-0">
                      <ShoppingBag className="size-4 text-denim/70" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-medium tracking-wide mb-1">Siparislerim</h4>
                    </div>
                  </div>
                </div>

                <div className="relative border border-navy/10 p-5 transition-colors duration-500 group hover:border-navy/20 hover-denim-corners sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-denim/10 flex items-center justify-center shrink-0">
                      <Heart className="size-4 text-denim/70" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-medium tracking-wide mb-1">Favorilerim</h4>
                    </div>
                  </div>
                </div>

                <div className="relative border border-navy/10 p-5 transition-colors duration-500 group hover:border-navy/20 hover-denim-corners sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-denim/10 flex items-center justify-center shrink-0">
                      <MapPin className="size-4 text-denim/70" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-medium tracking-wide mb-1">Adreslerim</h4>
                    </div>
                  </div>
                </div>

                <div className="relative border border-navy/10 p-5 transition-colors duration-500 group hover:border-navy/20 hover-denim-corners sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-denim/10 flex items-center justify-center shrink-0">
                      <Settings className="size-4 text-denim/70" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-medium tracking-wide mb-1">Ayarlar</h4>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border border-navy/10 p-4 sm:p-6 md:p-8">
                <h4 className="tracking-wide">Siparislerim</h4>
                {orders.length === 0 ? (
                  <p className="mt-3 text-sm text-navy/60">Henuz siparisiniz yok.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {orders.map((order) => (
                      <article key={order._id} className="border border-navy/10 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm">Siparis: {order._id}</p>
                          <p className="text-sm text-denim">{formatPrice(order.total)}</p>
                        </div>
                        <p className="mt-2 text-xs text-navy/60">
                          {new Date(order.createdAt).toLocaleString(storeConfig.locale)}
                        </p>
                        <ul className="mt-3 space-y-1 text-sm text-navy/70">
                          {order.items.map((item) => (
                            <li key={item._id}>
                              {item.productName} x {item.quantity}
                            </li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

