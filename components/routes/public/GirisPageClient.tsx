"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { storeConfig } from "@/lib/store-config";

export default function GirisPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!credentials.email || !credentials.password || (flow === "signUp" && !credentials.name)) {
      toast.error("Tum alanlari doldurun");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.set("flow", flow);
    formData.set("email", credentials.email);
    formData.set("password", credentials.password);
    if (credentials.name) {
      formData.set("name", credentials.name);
    }

    try {
      await signIn("password", formData);
      router.push("/");
    } catch (requestError) {
      if (requestError instanceof Error) {
        toast.error(requestError.message);
      } else {
        toast.error("Giris yapilamadi");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper text-navy">
      <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 text-center sm:mb-10">
          <h1>{storeConfig.logo.text}</h1>
          {storeConfig.storeSlogan ? (
            <p className="mt-2 text-xs uppercase tracking-280 text-denim">{storeConfig.storeSlogan}</p>
          ) : null}
        </div>

        <section className="p-0">
          <div className="mb-8 sm:mb-10">
            <p className="mb-3 text-xs uppercase tracking-300 text-denim">
              {flow === "signIn" ? "TEKRAR HOS GELDIN" : "KAYIT OL"}
            </p>
            <h2>{flow === "signIn" ? "Giris Yap" : "Hesap Olustur"}</h2>
            <div className="mt-4 h-[2px] w-12 bg-denim" />
          </div>

          <div className="flex flex-col gap-5 sm:gap-6">
            {flow === "signUp" ? (
              <div className="flex flex-col gap-2">
                <label htmlFor="giris-ad-soyad" className="text-xs uppercase tracking-200 text-navy/40">
                  Ad Soyad
                </label>
                <Input
                  id="giris-ad-soyad"
                  type="text"
                  name="name"
                  value={credentials.name}
                  onChange={(event) =>
                    setCredentials((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Ad Soyad"
                  className="h-11 rounded-none border-0 border-b border-navy/20 bg-transparent px-0 pb-3 text-base text-navy placeholder:text-navy/20 focus-visible:border-denim focus-visible:ring-0"
                  required
                />
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <label htmlFor="giris-eposta" className="text-xs uppercase tracking-200 text-navy/40">
                E Posta Adresi
              </label>
              <Input
                id="giris-eposta"
                type="email"
                name="email"
                value={credentials.email}
                onChange={(event) =>
                  setCredentials((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="ornek@email.com"
                className="h-11 rounded-none border-0 border-b border-navy/20 bg-transparent px-0 pb-3 text-base text-navy placeholder:text-navy/20 focus-visible:border-denim focus-visible:ring-0"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="giris-sifre" className="text-xs uppercase tracking-200 text-navy/40">
                Sifre
              </label>
              <Input
                id="giris-sifre"
                type="password"
                name="password"
                value={credentials.password}
                onChange={(event) =>
                  setCredentials((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder="********"
                className="h-11 rounded-none border-0 border-b border-navy/20 bg-transparent px-0 pb-3 text-base text-navy placeholder:text-navy/20 focus-visible:border-denim focus-visible:ring-0"
                minLength={8}
                required
              />
            </div>

            <Button type="button" onClick={() => void handleSubmit()} disabled={loading} className="mt-4 h-12 text-sm tracking-200">
              {loading ? "LUTFEN BEKLEYIN" : flow === "signIn" ? "GIRIS YAP" : "HESAP OLUSTUR"}
            </Button>

            <div className="mt-4 flex flex-col items-center gap-1 text-sm sm:flex-row sm:justify-center sm:gap-2">
              <span className="text-navy/40">
                {flow === "signIn" ? "Hesabin yok mu" : "Zaten hesabin var mi"}
              </span>
              <Button
                type="button"
                variant="link"
                className="self-center text-xs tracking-150 text-denim no-underline hover:text-navy"
                onClick={() => {
                  setFlow(flow === "signIn" ? "signUp" : "signIn");
                  setCredentials({
                    name: "",
                    email: "",
                    password: "",
                  });
                }}
              >
                {flow === "signIn" ? "Kayit Ol" : "Giris Yap"}
              </Button>
            </div>
          </div>
        </section>

        <div className="mt-8 border-t border-navy/10 pt-6">
          <p className="text-center text-xs text-navy/20">
            © {new Date().getFullYear()} {storeConfig.legalName}. Tum haklari saklidir.
          </p>
        </div>
      </main>
    </div>
  );
}

