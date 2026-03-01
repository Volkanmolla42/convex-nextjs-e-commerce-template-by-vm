"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import AdminGuard from "@/components/admin/AdminGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProductFormState = {
  name: string;
  description: string;
  details: string;
  careInstructions: string;
  price: string;
  stock: string;
  categoryId: Id<"categories">;
  isActive: boolean;
  isFeatured: boolean;
};

type AdminCategory = {
  _id: Id<"categories">;
  name: string;
};

type AdminProduct = {
  _id: Id<"products">;
  name: string;
  description: string;
  details: string;
  careInstructions: string;
  price: number;
  stock: number;
  categoryId: Id<"categories">;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl: string;
};

function parsePositiveNumber(value: string, fieldName: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${fieldName} gecersiz`);
  }
  return parsed;
}

function EditProductForm({
  product,
  categories,
}: {
  product: AdminProduct;
  categories: AdminCategory[];
}) {
  const updateProduct = useMutation(api.products.update);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);

  const [form, setForm] = useState<ProductFormState>({
    name: product.name,
    description: product.description,
    details: product.details,
    careInstructions: product.careInstructions,
    price: String(product.price),
    stock: String(product.stock),
    categoryId: product.categoryId,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");

    try {
      let imageStorageId: Id<"_storage"> | undefined;

      if (imageFile) {
        const uploadUrl = await generateUploadUrl({});
        const uploadResult = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        if (!uploadResult.ok) {
          throw new Error("Gorsel yuklenemedi");
        }

        const uploadPayload = (await uploadResult.json()) as { storageId?: string };
        if (!uploadPayload.storageId) {
          throw new Error("Gorsel id bulunamadi");
        }
        imageStorageId = uploadPayload.storageId as Id<"_storage">;
      }

      await updateProduct({
        productId: product._id,
        name: form.name,
        description: form.description,
        details: form.details,
        careInstructions: form.careInstructions,
        price: parsePositiveNumber(form.price, "Fiyat"),
        stock: parsePositiveNumber(form.stock, "Stok"),
        categoryId: form.categoryId,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        imageStorageId,
      });

      setImageFile(null);
      setStatusMessage("Urun guncellendi");
    } catch (error) {
      if (error instanceof Error) {
        setStatusMessage(error.message);
      } else {
        setStatusMessage("Urun guncellenemedi");
      }
    }
  }

  return (
    <section className="border border-navy/10 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1>Urun Duzenle</h1>
        <Button asChild variant="outlineGold">
          <Link href="/yonetim/urunler">Listeye Don</Link>
        </Button>
      </div>
      {statusMessage ? <p className="mt-2 text-sm text-denim">{statusMessage}</p> : null}

      <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Urun Adi</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Urun Gorseli</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-navy/50">
            {imageFile ? imageFile.name : product.imageUrl || "Yuklu gorsel"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Kisa Aciklama</Label>
          <Input
            id="description"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="details">Detaylar</Label>
          <Input
            id="details"
            value={form.details}
            onChange={(event) => setForm((prev) => ({ ...prev, details: event.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="care">Bakim Talimati</Label>
          <Input
            id="care"
            value={form.careInstructions}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, careInstructions: event.target.value }))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Fiyat</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step={0.01}
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stok</Label>
          <Input
            id="stock"
            type="number"
            min={0}
            value={form.stock}
            onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Kategori Secimi</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                type="button"
                key={category._id}
                size="sm"
                variant={form.categoryId === category._id ? "default" : "outlineGold"}
                onClick={() => setForm((prev) => ({ ...prev, categoryId: category._id }))}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={form.isActive ? "default" : "outlineGold"}
            onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
          >
            {form.isActive ? "Aktif" : "Pasif"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={form.isFeatured ? "default" : "outlineGold"}
            onClick={() => setForm((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))}
          >
            {form.isFeatured ? "One Cikan" : "Normal"}
          </Button>
        </div>

        <div className="md:col-span-2">
          <Button type="submit">Kaydet</Button>
        </div>
      </form>
    </section>
  );
}

export default function YonetimUrunDuzenlePage() {
  const params = useParams<{ id: string }>();
  const productId = params.id as Id<"products">;

  const product = useQuery(api.products.getAdminById, { productId });
  const categories = useQuery(api.categories.listAdmin);

  return (
    <AdminGuard>
      {() => {
        if (product === undefined || categories === undefined) {
          return (
            <div className="border border-navy/10 p-6 text-center">
              <h1>Yukleniyor</h1>
            </div>
          );
        }

        if (!product) {
          return (
            <div className="border border-navy/10 p-6 text-center">
              <h1>Urun bulunamadi</h1>
            </div>
          );
        }

        return <EditProductForm key={product._id} product={product} categories={categories} />;
      }}
    </AdminGuard>
  );
}
