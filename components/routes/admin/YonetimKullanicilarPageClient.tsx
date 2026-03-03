"use client";

import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { storeConfig } from "@/lib/store-config";

type YonetimKullanicilarPageClientProps = {
  preloadedAdmins: Preloaded<typeof api.admin.listAdmins>;
};

export default function YonetimKullanicilarPageClient({
  preloadedAdmins,
}: YonetimKullanicilarPageClientProps) {
  const admins = usePreloadedQuery(preloadedAdmins);
  const demoteFromAdmin = useMutation(api.admin.demoteFromAdmin);

  async function onDemote(userId: Id<"users">) {
    if (!confirm("Bu kullanicinin admin yetkisini kaldirmak istediginizden emin misiniz?")) {
      return;
    }

    try {
      await demoteFromAdmin({ userId });
      toast.success("Admin yetkisi kaldirildi");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Yetki kaldirilamadi");
      }
    }
  }

  return (
    <section className="rounded-lg border border-border bg-background p-6">
      <h1 className="text-2xl">Admin Kullanicilar</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Admin yetkisine sahip kullanicilar. Yeni admin eklemek icin Convex dashboard&apos;dan
        promoteToAdmin mutation&apos;ini kullanin.
      </p>

      {admins.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Admin kullanici yok</p>
      ) : (
        <div className="mt-6 space-y-3">
          {admins.map((admin) => (
            <article
              key={admin.userId}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5"
            >
              <div className="flex-1">
                <p className="font-medium">{admin.name || admin.email}</p>
                <p className="mt-1 text-sm text-muted-foreground">{admin.email}</p>
                {admin.fullName && (
                  <p className="text-sm text-muted-foreground">{admin.fullName}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Eklendi: {new Date(admin.createdAt).toLocaleString(storeConfig.locale)}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="danger"
                onClick={() => void onDemote(admin.userId)}
              >
                Yetkiyi Kaldir
              </Button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
