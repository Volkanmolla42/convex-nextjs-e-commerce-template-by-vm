"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type HesabimFavorilerimPageClientProps = {
  preloadedWishlist: Preloaded<typeof api.wishlist.listMine>;
};

export default function HesabimFavorilerimPageClient({
  preloadedWishlist,
}: HesabimFavorilerimPageClientProps) {
  const wishlist = usePreloadedQuery(preloadedWishlist);

  return (
    <section className="space-y-4">
      <h2>Favorilerim</h2>
      {wishlist.length === 0 ? (
        <div className="border border-border p-4">
          <p>Favori urun yok.</p>
        </div>
      ) : (
        <div className="border border-border p-4">
          <p>{wishlist.length} favori urun var.</p>
        </div>
      )}
    </section>
  );
}
