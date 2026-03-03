"use client";

import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { storeConfig } from "@/lib/store-config";

type YonetimYorumlarPageClientProps = {
  preloadedReviews: Preloaded<typeof api.admin.listPendingReviews>;
};

export default function YonetimYorumlarPageClient({
  preloadedReviews,
}: YonetimYorumlarPageClientProps) {
  const reviews = usePreloadedQuery(preloadedReviews);
  const updateStatus = useMutation(api.admin.updateReviewStatus);

  async function onApprove(reviewId: Id<"reviews">) {
    try {
      await updateStatus({ reviewId, status: "approved" });
      toast.success("Yorum onaylandi");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Yorum onaylanamadi");
      }
    }
  }

  async function onReject(reviewId: Id<"reviews">) {
    try {
      await updateStatus({ reviewId, status: "rejected" });
      toast.success("Yorum reddedildi");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Yorum reddedilemedi");
      }
    }
  }

  return (
    <section className="rounded-lg border border-border bg-background p-6">
      <h1 className="text-2xl">Yorum Moderasyonu</h1>
      {reviews.page.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Onay bekleyen yorum yok</p>
      ) : (
        <div className="mt-6 space-y-3">
          {reviews.page.map((review) => (
            <article key={review._id} className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <h3 className="font-medium">{review.productName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {review.userName} - {review.rating}/5 yildiz
                  </p>
                  <p className="text-sm">{review.comment}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleString(storeConfig.locale)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void onApprove(review._id)}
                  >
                    Onayla
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => void onReject(review._id)}
                  >
                    Reddet
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
