"use client";

import Link from "next/link";
import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { storeConfig } from "@/lib/store-config";

function formatPrice(value: number) {
  return new Intl.NumberFormat(storeConfig.locale, {
    style: "currency",
    currency: storeConfig.currency,
  }).format(value);
}

type YonetimUrunlerPageClientProps = {
  preloadedProducts: Preloaded<typeof api.admin.listAdminProducts>;
};

export default function YonetimUrunlerPageClient({
  preloadedProducts,
}: YonetimUrunlerPageClientProps) {
  const products = usePreloadedQuery(preloadedProducts);
  const removeProduct = useMutation(api.admin.removeProduct);

  async function onDelete(productId: Id<"products">) {
    try {
      await removeProduct({ productId });
      toast.success("Urun silindi");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Urun silinemedi");
      }
    }
  }

  return (
    <section className="rounded-lg border border-border bg-background p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl">Urunler</h1>
        <Button asChild size="lg">
          <Link href="/yonetim/urun-ekle">Yeni Urun</Link>
        </Button>
      </div>

      {products.page.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Urun yok</p>
      ) : (
        <div className="mt-6 space-y-3">
          {products.page.map((product) => (
            <article
              key={product._id}
              className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1 space-y-1">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.categoryName || "Kategori yok"}</p>
                <div className="flex gap-4">
                  <p className="text-sm text-muted-foreground">Varyant: {product.variantCount ?? 0}</p>
                  <p className="text-sm font-medium text-primary">{formatPrice(product.price)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outlineGold">
                  <Link href={`/yonetim/urunler/${product._id}/duzenle`}>Duzenle</Link>
                </Button>
                <Button type="button" size="sm" variant="danger" onClick={() => void onDelete(product._id)}>
                  Sil
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
