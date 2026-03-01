"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import AdminGuard from "@/components/admin/AdminGuard";
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

export default function YonetimKategorilerPage() {
  const categories = useQuery(api.categories.listAdmin);
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const removeCategory = useMutation(api.categories.remove);

  const [form, setForm] = useState<CategoryFormState>(emptyForm);
  const [editingId, setEditingId] = useState<Id<"categories"> | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");

    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        sortOrder: parseSortOrder(form.sortOrder),
      };

      if (editingId) {
        await updateCategory({ categoryId: editingId, ...payload });
        setStatusMessage("Kategori guncellendi");
      } else {
        await createCategory(payload);
        setStatusMessage("Kategori eklendi");
      }

      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      if (error instanceof Error) {
        setStatusMessage(error.message);
      } else {
        setStatusMessage("Kategori kaydedilemedi");
      }
    }
  }

  async function onDelete(categoryId: Id<"categories">) {
    setStatusMessage("");
    try {
      await removeCategory({ categoryId });
      setStatusMessage("Kategori silindi");
      if (editingId === categoryId) {
        setEditingId(null);
        setForm(emptyForm);
      }
    } catch (error) {
      if (error instanceof Error) {
        setStatusMessage(error.message);
      } else {
        setStatusMessage("Kategori silinemedi");
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
          <div className="space-y-4">
            <section className="border border-navy/10 p-4 sm:p-6">
              <h1>Kategoriler</h1>
              {statusMessage ? <p className="mt-2 text-sm text-denim">{statusMessage}</p> : null}

              <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3" onSubmit={onSubmit}>
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
                <div className="md:col-span-3 flex gap-2">
                  <Button type="submit">{editingId ? "Kategoriyi Guncelle" : "Kategori Ekle"}</Button>
                  {editingId ? (
                    <Button
                      type="button"
                      variant="outlineGold"
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

            <section className="border border-navy/10 p-4 sm:p-6">
              <h2>Kategori Listesi</h2>
              {categories.length === 0 ? (
                <p className="mt-3 text-sm text-navy/60">Kategori yok</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {categories.map((category) => (
                    <article
                      key={category._id}
                      className="flex flex-col gap-3 border border-navy/10 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <h3>{category.name}</h3>
                        <p className="text-sm text-navy/60">{category.description || "Aciklama yok"}</p>
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
      }}
    </AdminGuard>
  );
}

