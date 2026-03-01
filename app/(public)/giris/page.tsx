import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";
import GirisPageClient from "@/components/routes/public/GirisPageClient";

export default async function GirisPage() {
  const token = await convexAuthNextjsToken();
  if (token) {
    redirect("/hesabim");
  }

  return <GirisPageClient />;
}
