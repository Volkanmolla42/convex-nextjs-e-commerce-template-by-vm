import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import HesabimAyarlarPageClient from "@/components/routes/public/HesabimAyarlarPageClient";
import { requireAuthToken } from "@/lib/auth-server";

export default async function HesabimAyarlarPage() {
  const token = await requireAuthToken();
  const preloadedUser = await preloadQuery(api.userFunctions.currentUser, {}, { token });

  return <HesabimAyarlarPageClient preloadedUser={preloadedUser} />;
}
