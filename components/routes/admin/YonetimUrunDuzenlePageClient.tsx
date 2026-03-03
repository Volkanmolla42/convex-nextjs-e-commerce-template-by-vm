"use client";

import { type Dispatch, type FormEvent, type SetStateAction, useState } from "react";
import Link from "next/link";
import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProductVariantFormState = {
  clientKey: string;
  sku: string;
  color: string;
  size: string;
  price: string;
  stock: string;
  imageStorageId: Id<"_storage"> | null;
  imageFile: File | null;
  isActive: boolean;
};

type ProductFormState = {
  name: string;
  description: string;
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
  categoryId: Id<"categories">;
  isActive: boolean;
  isFeatured: boolean;
  variants?: Array<{
    _id: Id<"productVariants">;
    sku: string;
    attributes: Record<string, string>;
    imageStorageId: Id<"_storage">;
    image: string;
    price: number;
    stock: number;
    isActive: boolean;
  }>;
};

function createEmptyVariant(): ProductVariantFormState {
  return {
    clientKey: crypto.randomUUID(),
    sku: "",
    color: "",
    size: "",
    price: "0",
    stock: "0",
    imageStorageId: null,
    imageFile: null,
    isActive: true,
  };
}

function parsePositiveNumber(value: string, fieldName: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${fieldName} gecersiz`);
  }
  return parsed;
}

type VaryantEditorProps = {
  variants: ProductVariantFormState[];
  setVariants: Dispatch<SetStateAction<ProductVariantFormState[]>>;
};

function VaryantEditor({ variants, setVariants }: VaryantEditorProps) {
  return (
    <div className="md:col-span-2 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Varyantlar</h2>
        <Button
          type="button"
          size="sm"
          variant="outlineGold"
          onClick={() => setVariants((prev) => [...prev, createEmptyVariant()])}
        >
          <Plus className="mr-1 size-4" />
          Varyant Ekle
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {variants.map((variant, index) => (
          <div
            key={variant.clientKey}
            className="grid gap-3 rounded-lg border border-border bg-background p-3 md:grid-cols-7"
          >
            <Input
              placeholder="SKU"
              value={variant.sku}
              onChange={(event) =>
                setVariants((prev) =>
                  prev.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, sku: event.target.value } : item,
                  ),
                )
              }
            />
            <Input
              placeholder="Renk"
              value={variant.color}
              onChange={(event) =>
                setVariants((prev) =>
                  prev.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, color: event.target.value } : item,
                  ),
                )
              }
            />
            <Input
              placeholder="Beden"
              value={variant.size}
              onChange={(event) =>
                setVariants((prev) =>
                  prev.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, size: event.target.value } : item,
                  ),
                )
              }
            />
            <Input
              placeholder="Fiyat"
              type="number"
              min={0}
              step={0.01}
              value={variant.price}
              onChange={(event) =>
                setVariants((prev) =>
                  prev.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, price: event.target.value } : item,
                  ),
                )
              }
            />
            <Input
              placeholder="Stok"
              type="number"
              min={0}
              value={variant.stock}
              onChange={(event) =>
                setVariants((prev) =>
                  prev.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, stock: event.target.value } : item,
                  ),
                )
              }
            />
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setVariants((prev) =>
                    prev.map((item, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...item,
                            imageFile: event.target.files?.[0] ?? null,
                          }
                        : item,
                    ),
                  )
                }
              />
              {variant.imageFile ? (
                <div className="relative h-20 w-20 overflow-hidden rounded border border-border">
                  <img
                    src={URL.createObjectURL(variant.imageFile)}
                    alt="Onizleme"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : variant.imageStorageId ? (
                <p className="text-xs text-muted-foreground">Yuklu gorsel mevcut</p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {variant.imageFile
                  ? variant.imageFile.name
                  : variant.imageStorageId
                    ? "Yuklu gorsel"
                    : "Gorsel secilmedi"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={variant.isActive ? "default" : "outlineGold"}
                onClick={() =>
                  setVariants((prev) =>
                    prev.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, isActive: !item.isActive }
                        : item,
                    ),
                  )
                }
              >
                {variant.isActive ? "Aktif" : "Pasif"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                onClick={() =>
                  setVariants((prev) =>
                    prev.length === 1
                      ? [createEmptyVariant()]
                      : prev.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditProductForm({
  product,
  categories,
}: {
  product: AdminProduct;
  categories: AdminCategory[];
}) {
  const updateProduct = useMutation(api.admin.updateProduct);
  const generateUploadUrl = useMutation(api.admin.generateUploadUrl);

  const [form, setForm] = useState<ProductFormState>({
    name: product.name,
    description: product.description,
    categoryId: product.categoryId,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
  });
  const [variants, setVariants] = useState<ProductVariantFormState[]>(
    product.variants && product.variants.length > 0
      ? product.variants.map((variant) => ({
          clientKey: variant._id,
          sku: variant.sku,
          color: variant.attributes.Renk ?? "",
          size: variant.attributes.Beden ?? "",
          price: String(variant.price),
          stock: String(variant.stock),
          imageStorageId: variant.imageStorageId,
          imageFile: null,
          isActive: variant.isActive,
        }))
      : [createEmptyVariant()],
  );

  async function uploadImage(file: File): Promise<Id<"_storage">> {
    const uploadUrl = await generateUploadUrl({});
    const uploadResult = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!uploadResult.ok) {
      throw new Error("Gorsel yuklenemedi");
    }

    const uploadPayload = (await uploadResult.json()) as { storageId?: string };
    if (!uploadPayload.storageId) {
      throw new Error("Gorsel id bulunamadi");
    }

    return uploadPayload.storageId as Id<"_storage">;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const normalizedVariants = await Promise.all(
        variants
          .filter((variant) => variant.sku.trim().length > 0)
          .map(async (variant, index) => {
            const imageStorageId =
              variant.imageFile
                ? await uploadImage(variant.imageFile)
                : variant.imageStorageId;

            if (!imageStorageId) {
              throw new Error(`${index + 1}. varyant icin gorsel zorunlu`);
            }

            return {
              sku: variant.sku,
              attributes: {
                Renk: variant.color,
                Beden: variant.size,
              },
              imageStorageId,
              price: parsePositiveNumber(variant.price, "Varyant fiyat"),
              stock: parsePositiveNumber(variant.stock, "Varyant stok"),
              isActive: variant.isActive,
            };
          }),
      );

      await updateProduct({
        productId: product._id,
        name: form.name,
        description: form.description,
        categoryId: form.categoryId,
        variants: normalizedVariants,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
      });

      setVariants((prev) =>
        prev.map((variant) => ({
          ...variant,
          imageFile: null,
        })),
      );
      toast.success("Urun guncellendi");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Urun guncellenemedi");
      }
    }
  }

  return (
    <section className="rounded-lg border border-border bg-background p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl">Urun Duzenle</h1>
        <Button asChild variant="outlineGold" size="lg">
          <Link href="/yonetim/urunler">Listeye Don</Link>
        </Button>
      </div>

      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Urun Adi</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Aciklama</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
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

        <div className="md:col-span-2 flex flex-wrap gap-3">
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

        <VaryantEditor variants={variants} setVariants={setVariants} />

        <div className="md:col-span-2">
          <Button type="submit" size="lg">Kaydet</Button>
        </div>
      </form>
    </section>
  );
}

type YonetimUrunDuzenlePageClientProps = {
  preloadedProduct: Preloaded<typeof api.admin.getAdminProductById>;
  preloadedCategories: Preloaded<typeof api.admin.listAdminCategories>;
};

export default function YonetimUrunDuzenlePageClient({
  preloadedProduct,
  preloadedCategories,
}: YonetimUrunDuzenlePageClientProps) {
  const product = usePreloadedQuery(preloadedProduct);
  const categories = usePreloadedQuery(preloadedCategories);

  if (!product) {
    return (
      <div className="border border-navy/10 p-6 text-center">
        <h1>Urun bulunamadi</h1>
      </div>
    );
  }

  return <EditProductForm key={product._id} product={product} categories={categories} />;
}
