"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AdminGuard from "@/components/admin/AdminGuard";
import { Button } from "@/components/ui/button";
import { storeConfig } from "@/lib/store-config";

function formatPrice(value: number) {
  return new Intl.NumberFormat(storeConfig.locale, {
    style: "currency",
    currency: storeConfig.currency,
  }).format(value);
}

export default function YonetimPanelPage() {
  const categories = useQuery(api.categories.listAdmin);
  const products = useQuery(api.products.listAdmin);
  const orders = useQuery(api.orders.listAdmin);

  return (
    <AdminGuard>
      {(user) => {
        if (categories === undefined || products === undefined || orders === undefined) {
          return (
            <div className="border border-navy/10 p-6 text-center">
              <h1>Yukleniyor</h1>
            </div>
          );
        }

        const latestOrders = orders.slice(0, 5);

        return (
          <div className="space-y-4">
            <section className="border border-navy/10 p-4 sm:p-6">
              <h1>Yonetim Paneli</h1>
              <p className="mt-2 text-sm text-navy/60">{user.email}</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="border border-navy/10 p-3">
                  <p className="text-xs text-navy/50">Kategori</p>
                  <p>{categories.length}</p>
                </div>
                <div className="border border-navy/10 p-3">
                  <p className="text-xs text-navy/50">Urun</p>
                  <p>{products.length}</p>
                </div>
                <div className="border border-navy/10 p-3">
                  <p className="text-xs text-navy/50">Siparis</p>
                  <p>{orders.length}</p>
                </div>
              </div>
            </section>

            <section className="border border-navy/10 p-4 sm:p-6">
              <h2>Hizli Islem</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild>
                  <Link href="/yonetim/urun-ekle">Urun Ekle</Link>
                </Button>
                <Button asChild variant="outlineGold">
                  <Link href="/yonetim/urunler">Urunleri Yonet</Link>
                </Button>
                <Button asChild variant="outlineGold">
                  <Link href="/yonetim/kategoriler">Kategorileri Yonet</Link>
                </Button>
              </div>
            </section>

            <section className="border border-navy/10 p-4 sm:p-6">
              <h2>Son Siparisler</h2>
              {latestOrders.length === 0 ? (
                <p className="mt-3 text-sm text-navy/60">Henuz siparis yok</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {latestOrders.map((order) => (
                    <article key={order._id} className="border border-navy/10 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm">Siparis: {order._id}</p>
                        <p className="text-sm text-denim">{formatPrice(order.total)}</p>
                      </div>
                      <p className="mt-1 text-xs text-navy/60">
                        {order.customerName} {order.userEmail ? `(${order.userEmail})` : ""}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        );
      }}
    </AdminGuard>
  );
}

