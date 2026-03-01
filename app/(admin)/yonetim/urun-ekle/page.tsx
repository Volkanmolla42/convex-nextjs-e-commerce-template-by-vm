"use client";

import { FormEvent, useState } from "react";
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
  categoryId: Id<"categories"> | null;
  isActive: boolean;
  isFeatured: boolean;
};

const emptyForm: ProductFormState = {
  name: "",
  description: "",
  details: "",
  careInstructions: "",
  price: "0",
  stock: "0",
  categoryId: null,
  isActive: true,
  isFeatured: false,
};

function parsePositiveNumber(value: string, fieldName: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${fieldName} gecersiz`);
  }
  return parsed;
}

export default function YonetimUrunEklePage() {
  const categories = useQuery(api.categories.listAdmin);
  const createProduct = useMutation(api.products.create);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);

  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");

    try {
      if (!form.categoryId) {
        throw new Error("Kategori secimi zorunlu");
      }
      if (!imageFile) {
        throw new Error("Urun gorseli zorunlu");
      }

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

      await createProduct({
        name: form.name,
        description: form.description,
        details: form.details,
        careInstructions: form.careInstructions,
        price: parsePositiveNumber(form.price, "Fiyat"),
        stock: parsePositiveNumber(form.stock, "Stok"),
        categoryId: form.categoryId,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        imageStorageId: uploadPayload.storageId as Id<"_storage">,
      });

      setForm(emptyForm);
      setImageFile(null);
      setStatusMessage("Urun eklendi");
    } catch (error) {
      if (error instanceof Error) {
        setStatusMessage(error.message);
      } else {
        setStatusMessage("Urun eklenemedi");
      }
    }
  }

  return (
    <AdminGuard>
      {() => {
        if (categories === undefined) {
          return (
            <div className="border border-navy/10 p-6 text-center">
              <h1>Yukleniyor</h1>
            </div>
          );
        }

        return (
          <section className="border border-navy/10 p-4 sm:p-6">
            <h1>Urun Ekle</h1>
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
                  {imageFile ? imageFile.name : "Henuz gorsel secilmedi"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Kisa Aciklama</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
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
                <Button type="submit">Urun Ekle</Button>
              </div>
            </form>
          </section>
        );
      }}
    </AdminGuard>
  );
}

