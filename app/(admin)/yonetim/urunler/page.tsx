"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
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

export default function YonetimUrunlerPage() {
  const products = useQuery(api.products.listAdmin);
  const removeProduct = useMutation(api.products.remove);
  const [statusMessage, setStatusMessage] = useState("");

  async function onDelete(productId: Id<"products">) {
    setStatusMessage("");
    try {
      await removeProduct({ productId });
      setStatusMessage("Urun silindi");
    } catch (error) {
      if (error instanceof Error) {
        setStatusMessage(error.message);
      } else {
        setStatusMessage("Urun silinemedi");
      }
    }
  }

  return (
    <AdminGuard>
      {() => {
        if (products === undefined) {
          return (
            <div className="border border-navy/10 p-6 text-center">
              <h1>Yukleniyor</h1>
            </div>
          );
        }

        return (
          <section className="border border-navy/10 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1>Urunler</h1>
              <Button asChild>
                <Link href="/yonetim/urun-ekle">Yeni Urun</Link>
              </Button>
            </div>
            {statusMessage ? <p className="mt-2 text-sm text-denim">{statusMessage}</p> : null}

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
      }}
    </AdminGuard>
  );
}
