import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-navy/10", className)}
      {...props}
    />
  );
}

function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[3/4] w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

function OrderCardSkeleton() {
  return (
    <div className="space-y-2 border border-navy/10 p-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

function ReviewCardSkeleton() {
  return (
    <div className="space-y-2 border border-navy/10 p-3">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

export { Skeleton, ProductCardSkeleton, OrderCardSkeleton, ReviewCardSkeleton };
