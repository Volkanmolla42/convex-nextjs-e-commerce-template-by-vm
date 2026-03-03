import { Button } from "./button";

type PaginationProps = {
  hasMore: boolean;
  isLoading?: boolean;
  onLoadMore: () => void;
  loadMoreText?: string;
};

export function Pagination({
  hasMore,
  isLoading = false,
  onLoadMore,
  loadMoreText = "Daha Fazla Yukle",
}: PaginationProps) {
  if (!hasMore) {
    return null;
  }

  return (
    <div className="flex justify-center py-4">
      <Button
        type="button"
        onClick={onLoadMore}
        disabled={isLoading}
        variant="outlineGold"
      >
        {isLoading ? "Yukleniyor..." : loadMoreText}
      </Button>
    </div>
  );
}
