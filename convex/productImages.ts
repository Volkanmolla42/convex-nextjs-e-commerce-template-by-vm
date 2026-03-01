import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

type AnyCtx = QueryCtx | MutationCtx;

export async function resolveProductImageUrl(
  ctx: AnyCtx,
  product: Doc<"products">,
) {
  if (product.imageStorageId) {
    const storageUrl = await ctx.storage.getUrl(product.imageStorageId);
    if (storageUrl) {
      return storageUrl;
    }
  }

  return product.image ?? "";
}

