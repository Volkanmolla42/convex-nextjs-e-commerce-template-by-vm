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

type HesabimSiparislerimPageClientProps = {
  preloadedOrders: Preloaded<typeof api.orders.listMine>;
};

export default function HesabimSiparislerimPageClient({
  preloadedOrders,
}: HesabimSiparislerimPageClientProps) {
  const orders = usePreloadedQuery(preloadedOrders);

  return (
    <section className="space-y-4">
      <h2>Siparislerim</h2>
      {orders.length === 0 ? (
        <div className="border border-border p-4">
          <p>Henuz siparisiniz yok.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <article key={order._id} className="border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p>Siparis No: {order.orderNo}</p>
                <p className="text-denim">{formatPrice(order.total)}</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleString(storeConfig.locale)}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
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
    </section>
  );
}
