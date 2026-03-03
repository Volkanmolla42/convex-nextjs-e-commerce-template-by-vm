"use client";

import { useEffect, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type HesabimAyarlarPageClientProps = {
  preloadedUser: Preloaded<typeof api.userFunctions.currentUser>;
};

export default function HesabimAyarlarPageClient({
  preloadedUser,
}: HesabimAyarlarPageClientProps) {
  const user = usePreloadedQuery(preloadedUser);
  const updateProfile = useMutation(api.userFunctions.updateProfile);
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user?.name]);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  async function handleSave() {
    setSaving(true);

    try {
      await updateProfile({ name: name.trim() || undefined });
      setIsEditing(false);
      toast.success("Profil guncellendi");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Profil guncellenemedi");
      }
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return null;
  }

  const isNameChanged = name !== (user.name || "");

  return (
    <section className="space-y-4 w-full">
      <h2>Ayarlar</h2>

      <div className="border border-navy/10 relative group hover:border-navy/20 transition-colors duration-500 hover-denim-corners">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-navy/10 px-4 py-5 sm:flex-row sm:items-center sm:px-6 sm:py-6 md:px-8">
          <div>
            <p className="text-denim text-xs tracking-300 uppercase mb-1">PROFIL</p>
            <h3 className="font-light">Kisisel Bilgiler</h3>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
            {isEditing && isNameChanged ? (
              <Button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                size="sm"
                className="h-10 flex-1 gap-2 sm:h-auto sm:flex-none"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                  setName(user.name || "");
                } else {
                  setIsEditing(true);
                  setName(user.name || "");
                }
              }}
              variant={isEditing ? "outline" : "outlineGold"}
              size="sm"
              className="h-10 flex-1 gap-2 sm:h-auto sm:flex-none"
            >
              {!isEditing ? <Pencil className="size-3.5" strokeWidth={1.5} /> : null}
              {isEditing ? "Iptal" : "Duzenle"}
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8">
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
              <div className="md:w-1/3">
                <label htmlFor="hesabim-ad-soyad" className="text-navy/40 text-xs tracking-200 uppercase">
                  Ad Soyad
                </label>
              </div>
              <div className="md:w-2/3">
                {isEditing ? (
                  <Input
                    id="hesabim-ad-soyad"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-10 w-full rounded-none border-0 border-b border-navy/20 bg-transparent px-0 pb-3 text-base text-navy placeholder:text-navy/20 focus-visible:border-denim focus-visible:ring-0"
                    placeholder="Adinizi girin"
                  />
                ) : (
                  <p className="text-navy text-base pb-3 border-b border-transparent">
                    {user.name || <span className="text-navy/30 italic">Belirtilmemis</span>}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
              <div className="md:w-1/3">
                <p className="text-navy/40 text-xs tracking-200 uppercase">E-posta</p>
              </div>
              <div className="md:w-2/3">
                <p className="text-navy/60 text-base pb-3 border-b border-transparent flex items-center gap-2">
                  {user.email}
                  <span className="text-navy/20 text-xs tracking-150 uppercase">
                    (degistirilemez)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-navy/10 p-4">
        <Button type="button" variant="danger" onClick={() => void handleSignOut()}>
          Cikis Yap
        </Button>
      </div>
    </section>
  );
}
