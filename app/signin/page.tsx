"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isSignIn = flow === "signIn";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader className="space-y-3">
          <CardTitle className="text-center text-2xl">
            {isSignIn ? "Giris Yap" : "Kayit Ol"}
          </CardTitle>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={isSignIn ? "default" : "outline"}
              onClick={() => {
                setFlow("signIn");
                setError(null);
              }}
            >
              Giris
            </Button>
            <Button
              type="button"
              variant={isSignIn ? "outline" : "default"}
              onClick={() => {
                setFlow("signUp");
                setError(null);
              }}
            >
              Kayit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);
              setError(null);
              const formData = new FormData(e.target as HTMLFormElement);
              formData.set("flow", flow);
              void signIn("password", formData)
                .catch((error) => {
                  setError(error.message);
                  setLoading(false);
                })
                .then(() => {
                  router.push("/");
                });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Sifre</Label>
              <Input
                id="password"
                type="password"
                name="password"
                autoComplete={
                  isSignIn ? "current-password" : "new-password"
                }
                minLength={8}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Yukleniyor" : isSignIn ? "Giris Yap" : "Kayit Ol"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <Button
            type="button"
            variant="link"
            onClick={() => {
              setFlow(isSignIn ? "signUp" : "signIn");
              setError(null);
            }}
          >
            {isSignIn ? "Hesabin yoksa kayit ol" : "Hesabin varsa giris yap"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
