"use client";

import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { storeConfig } from "@/lib/store-config";
import { Button } from "@/components/ui/button";

function formatPrice(value: number) {
  return new Intl.NumberFormat(storeConfig.locale, {
    style: "currency",
    currency: storeConfig.currency,
  }).format(value);
}

const ORDER_STATUS_LABELS = {
  pending: "Beklemede",
  paid: "Odendi",
  shipped: "Kargolandi",
  cancelled: "Iptal Edildi",
} as const;

const ORDER_STATUS_COLORS = {
  pending: "text-muted-foreground",
  paid: "text-primary",
  shipped: "text-accent-foreground",
  cancelled: "text-destructive",
} as const;

type YonetimSiparislerPageClientProps = {
  preloadedOrders: Preloaded<typeof api.admin.listAdminOrders>;
};

export default function YonetimSiparislerPageClient({
  preloadedOrders,
}: YonetimSiparislerPageClientProps) {
  const orders = usePreloadedQuery(preloadedOrders);
  const updateStatus = useMutation(api.admin.updateOrderStatus);

  async function onUpdateStatus(
    orderId: Id<"orders">,
    status: "pending" | "paid" | "shipped" | "cancelled"
  ) {
    try {
      await updateStatus({ orderId, status });
      toast.success("Siparis durumu guncellendi");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Durum guncellenemedi");
      }
    }
  }

  return (
    <section className="rounded-lg border border-border bg-background p-6">
      <h1 className="text-2xl">Siparisler</h1>
      {orders.page.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Henuz siparis yok</p>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.page.map((order) => (
            <article key={order._id} className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <p className="font-medium">#{order.orderNo}</p>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.customerName} {order.userEmail ? `(${order.userEmail})` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString(storeConfig.locale)}
                  </p>
                  <p className="text-lg font-semibold text-primary">{formatPrice(order.total)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.status !== "paid" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outlineGold"
                      onClick={() => void onUpdateStatus(order._id, "paid")}
                    >
                      Odendi
                    </Button>
                  )}
                  {order.status === "paid" && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void onUpdateStatus(order._id, "shipped")}
                    >
                      Kargola
                    </Button>
                  )}
                  {order.status !== "cancelled" && order.status !== "shipped" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => void onUpdateStatus(order._id, "cancelled")}
                    >
                      Iptal
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
