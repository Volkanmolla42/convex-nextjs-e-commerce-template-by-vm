"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { storeConfig } from "@/lib/store-config";

function formatPrice(value: number) {
  return new Intl.NumberFormat(storeConfig.locale, {
    style: "currency",
    currency: storeConfig.currency,
  }).format(value);
}

type YonetimSiparislerPageClientProps = {
  preloadedOrders: Preloaded<typeof api.admin.listAdminOrders>;
};

export default function YonetimSiparislerPageClient({
  preloadedOrders,
}: YonetimSiparislerPageClientProps) {
  const orders = usePreloadedQuery(preloadedOrders);

  return (
    <section className="border border-navy/10 p-4 sm:p-6">
      <h1>Siparisler</h1>
      {orders.length === 0 ? (
        <p className="mt-3 text-sm text-navy/60">Henuz siparis yok</p>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <article key={order._id} className="border border-navy/10 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm">Siparis: {order._id}</p>
                <p className="text-sm text-denim">{formatPrice(order.total)}</p>
              </div>
              <p className="mt-1 text-xs text-navy/60">
                Musteri: {order.customerName} {order.userEmail ? `(${order.userEmail})` : ""}
              </p>
              <p className="text-xs text-navy/60">
                {new Date(order.createdAt).toLocaleString(storeConfig.locale)}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
