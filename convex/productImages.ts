import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

type AnyCtx = QueryCtx | MutationCtx;

const PLACEHOLDER_IMAGE = "https://placehold.co/800x1000/e8e4dc/1a1a1a?text=Gorsel+Yok";

export async function resolveVariantImageUrl(
  ctx: AnyCtx,
  variant: Doc<"productVariants">,
) {
  const storageUrl = await ctx.storage.getUrl(variant.imageStorageId);
  if (storageUrl) {
    return storageUrl;
  }

  return PLACEHOLDER_IMAGE;
}
