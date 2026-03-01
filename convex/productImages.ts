import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

type AnyCtx = QueryCtx | MutationCtx;

export async function resolveVariantImageUrl(
  ctx: AnyCtx,
  variant: Doc<"productVariants">,
) {
  const storageUrl = await ctx.storage.getUrl(variant.imageStorageId);
  if (storageUrl) {
    return storageUrl;
  }

  return "";
}
