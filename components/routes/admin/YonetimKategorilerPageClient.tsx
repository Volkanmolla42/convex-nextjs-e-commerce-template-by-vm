"use client";

import { FormEvent, useState } from "react";
import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CategoryFormState = {
  name: string;
  description: string;
  sortOrder: string;
};

const emptyForm: CategoryFormState = {
  name: "",
  description: "",
  sortOrder: "0",
};

function parseSortOrder(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Kategori sirasi gecersiz");
  }
  return parsed;
}

type YonetimKategorilerPageClientProps = {
  preloadedCategories: Preloaded<typeof api.admin.listAdminCategories>;
};

export default function YonetimKategorilerPageClient({
  preloadedCategories,
}: YonetimKategorilerPageClientProps) {
  const categories = usePreloadedQuery(preloadedCategories);
  const createCategory = useMutation(api.admin.createCategory);
  const updateCategory = useMutation(api.admin.updateCategory);
  const removeCategory = useMutation(api.admin.removeCategory);

  const [form, setForm] = useState<CategoryFormState>(emptyForm);
  const [editingId, setEditingId] = useState<Id<"categories"> | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        sortOrder: parseSortOrder(form.sortOrder),
      };

      if (editingId) {
        await updateCategory({ categoryId: editingId, ...payload });
        toast.success("Kategori guncellendi");
      } else {
        await createCategory(payload);
        toast.success("Kategori eklendi");
      }

      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Kategori kaydedilemedi");
      }
    }
  }

  async function onDelete(categoryId: Id<"categories">) {
    try {
      await removeCategory({ categoryId });
      toast.success("Kategori silindi");
      if (editingId === categoryId) {
        setEditingId(null);
        setForm(emptyForm);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Kategori silinemedi");
      }
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-background p-6">
        <h1 className="text-2xl">{editingId ? "Kategori Duzenle" : "Yeni Kategori"}</h1>

        <form className="mt-6 grid gap-4 md:grid-cols-3" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Kategori Adi</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Aciklama</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sira</Label>
            <Input
              id="sortOrder"
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, sortOrder: event.target.value }))
              }
            />
          </div>
          <div className="md:col-span-3 flex gap-3">
            <Button type="submit" size="lg">{editingId ? "Guncelle" : "Ekle"}</Button>
            {editingId ? (
              <Button
                type="button"
                variant="outlineGold"
                size="lg"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Vazgec
              </Button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-border bg-background p-6">
        <h2 className="text-xl">Kategori Listesi</h2>
        {categories.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Kategori yok</p>
        ) : (
          <div className="mt-4 space-y-3">
            {categories.map((category) => (
              <article
                key={category._id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{category.description || "Aciklama yok"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Sira: {category.sortOrder}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outlineGold"
                    onClick={() => {
                      setEditingId(category._id);
                      setForm({
                        name: category.name,
                        description: category.description || "",
                        sortOrder: String(category.sortOrder),
                      });
                    }}
                  >
                    Duzenle
                  </Button>
                  <Button type="button" size="sm" variant="danger" onClick={() => void onDelete(category._id)}>
                    Sil
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
