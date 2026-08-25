import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageHeaderSkeleton({
  className,
  blurbWidth = "max-w-lg",
}: {
  className?: string;
  blurbWidth?: string;
}) {
  return (
    <div className={cn("mb-6 sm:mb-8", className)}>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-10 w-48 sm:h-12 sm:w-56 lg:h-14 lg:w-64" />
      <Skeleton className={cn("mt-4 h-4 w-full", blurbWidth)} />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-background">
      <Skeleton className="aspect-4/5 w-full" />
      <div className="space-y-2 px-3 pb-4 pt-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-28" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 *:border-r *:border-b *:border-border/40",
        className,
      )}
    >
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BrandTileSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-16/10 w-full sm:aspect-21/9" />
      <div className="px-3 pb-4 pt-2.5 sm:px-4 sm:pb-5 sm:pt-3">
        <Skeleton className="h-5 w-32 sm:h-6 sm:w-40" />
        <Skeleton className="mt-2 h-3 w-16" />
      </div>
    </div>
  );
}

export function ShopToolbarSkeleton() {
  return (
    <div className="mb-10 space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-11 min-w-0 flex-1" />
        <Skeleton className="h-11 w-24 shrink-0" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-11 w-full sm:w-64" />
        <Skeleton className="h-11 w-28" />
        <Skeleton className="h-11 w-24" />
        <Skeleton className="size-11 sm:size-9" />
      </div>
    </div>
  );
}

export function SectionHeaderSkeleton() {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-12">
      <div className="min-w-0 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-48 sm:h-10 sm:w-56" />
      </div>
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
