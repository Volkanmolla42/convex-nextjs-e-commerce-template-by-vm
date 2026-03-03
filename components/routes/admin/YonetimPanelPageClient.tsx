"use client";

import Link from "next/link";
import { type Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { storeConfig } from "@/lib/store-config";

function formatPrice(value: number) {
  return new Intl.NumberFormat(storeConfig.locale, {
    style: "currency",
    currency: storeConfig.currency,
  }).format(value);
}

type YonetimPanelPageClientProps = {
  preloadedUser: Preloaded<typeof api.userFunctions.currentUser>;
  preloadedCategories: Preloaded<typeof api.admin.listAdminCategories>;
  preloadedProducts: Preloaded<typeof api.admin.listAdminProducts>;
  preloadedOrders: Preloaded<typeof api.admin.listAdminOrders>;
};

export default function YonetimPanelPageClient({
  preloadedUser,
  preloadedCategories,
  preloadedProducts,
  preloadedOrders,
}: YonetimPanelPageClientProps) {
  const user = usePreloadedQuery(preloadedUser);
  const categories = usePreloadedQuery(preloadedCategories);
  const products = usePreloadedQuery(preloadedProducts);
  const orders = usePreloadedQuery(preloadedOrders);
  const latestOrders = orders.page.slice(0, 5);

  if (!user) {
    return null;
  }

  const totalRevenue = orders.page.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.page.filter((order) => order.status === "pending").length;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-background p-6">
        <h1 className="text-2xl">Yonetim Paneli</h1>
        <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Kategori</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{categories.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Urun</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{products.page.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Toplam Siparis</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{orders.page.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Bekleyen Siparis</p>
            <p className="mt-2 text-3xl font-semibold text-primary">{pendingOrders}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 sm:col-span-2">
            <p className="text-xs text-muted-foreground">Toplam Gelir</p>
            <p className="mt-2 text-3xl font-semibold text-accent-foreground">{formatPrice(totalRevenue)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-background p-6">
        <h2 className="text-xl">Hizli Islem</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/yonetim/urun-ekle">Urun Ekle</Link>
          </Button>
          <Button asChild variant="outlineGold" size="lg">
            <Link href="/yonetim/urunler">Urunleri Yonet</Link>
          </Button>
          <Button asChild variant="outlineGold" size="lg">
            <Link href="/yonetim/kategoriler">Kategorileri Yonet</Link>
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-background p-6">
        <h2 className="text-xl">Son Siparisler</h2>
        {latestOrders.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Henuz siparis yok</p>
        ) : (
          <div className="mt-4 space-y-3">
            {latestOrders.map((order) => (
              <article key={order._id} className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">Siparis #{order._id.slice(-8)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.customerName} {order.userEmail ? `(${order.userEmail})` : ""}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-primary">{formatPrice(order.total)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
