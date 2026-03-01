"use client";

import type { ReactNode } from "react";
import { useQuery } from "convex/react";
import type { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { isAdminEmail } from "@/lib/admin";

type AdminGuardProps = {
  children: (user: Doc<"users">) => ReactNode;
};

export default function AdminGuard({ children }: AdminGuardProps) {
  const user = useQuery(api.userFunctions.currentUser);

  if (user === undefined) {
    return (
      <div className="border border-navy/10 p-6 text-center">
        <h1>Yukleniyor</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="border border-navy/10 p-6 text-center">
        <h1>Giris gerekli</h1>
      </div>
    );
  }

  if (!isAdminEmail(user.email)) {
    return (
      <div className="border border-navy/10 p-6 text-center">
        <h1>Yetkisiz</h1>
      </div>
    );
  }

  return <>{children(user)}</>;
}

