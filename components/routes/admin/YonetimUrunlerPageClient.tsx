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
    <section className="border border-navy/10 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1>Urunler</h1>
        <Button asChild>
          <Link href="/yonetim/urun-ekle">Yeni Urun</Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <p className="mt-4 text-sm text-navy/60">Urun yok</p>
      ) : (
        <div className="mt-4 space-y-3">
          {products.map((product) => (
            <article
              key={product._id}
              className="flex flex-col gap-3 border border-navy/10 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3>{product.name}</h3>
                <p className="text-sm text-navy/60">{product.categoryName || "Kategori yok"}</p>
                <p className="text-sm text-navy/60">Varyant: {product.variantCount ?? 0}</p>
                <p className="text-sm text-navy/60">{formatPrice(product.price)}</p>
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
