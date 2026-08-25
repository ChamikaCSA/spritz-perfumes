import { Skeleton } from "@/components/ui/skeleton";
import {
  BrandTileSkeleton,
  PageHeaderSkeleton,
  ProductGridSkeleton,
  ShopToolbarSkeleton,
} from "@/components/store/skeletons/primitives";

export function ShopSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pt-32"
      aria-busy="true"
      aria-label="Loading shop"
    >
      <PageHeaderSkeleton />
      <ShopToolbarSkeleton />
      <ProductGridSkeleton
        count={10}
        className="md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      />
    </div>
  );
}

export function BrandsSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pt-32"
      aria-busy="true"
      aria-label="Loading brands"
    >
      <PageHeaderSkeleton className="mb-6 sm:mb-10 lg:mb-12" />
      <div className="grid grid-cols-2 *:border-r *:border-b *:border-border/40 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => (
          <BrandTileSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function BrandDetailSkeleton() {
  return (
    <div className="pb-20" aria-busy="true" aria-label="Loading brand">
      <section className="relative isolate overflow-hidden border-b border-border/40">
        <Skeleton className="absolute inset-0 rounded-none opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 sm:pb-12 sm:pt-28 lg:px-8 lg:pt-32">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8">
            <Skeleton className="size-24 shrink-0 sm:size-28" />
            <div className="min-w-0 max-w-2xl flex-1 space-y-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-56 sm:h-12 sm:w-72" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-4 w-full max-w-xl" />
              <Skeleton className="h-4 w-3/4 max-w-md" />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <ProductGridSkeleton
          count={10}
          className="md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        />
      </div>
    </div>
  );
}

export function WishlistSkeleton({
  includeHeader = true,
}: {
  includeHeader?: boolean;
}) {
  return (
    <div
      className={
        includeHeader
          ? "mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pt-32"
          : undefined
      }
      aria-busy="true"
      aria-label="Loading wishlist"
    >
      {includeHeader ? <PageHeaderSkeleton className="mb-6 sm:mb-10" /> : null}
      <ProductGridSkeleton
        count={10}
        className="md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      />
    </div>
  );
}

export function ProsePageSkeleton({
  contact = false,
}: {
  contact?: boolean;
}) {
  return (
    <div
      className="mx-auto max-w-3xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28 lg:pt-32"
      aria-busy="true"
      aria-label="Loading page"
    >
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-10 w-48 sm:h-12 sm:w-56 lg:h-14" />
      {contact ? (
        <>
          <Skeleton className="mt-4 h-4 w-full max-w-xl" />
          <div className="mt-12 space-y-4 border-t border-border/50 pt-10">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-12 w-44" />
          </div>
          <div className="mt-14 grid gap-10 border-t border-border/50 pt-10 sm:grid-cols-2">
            <div className="space-y-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-40" />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mt-8 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="mt-10 h-12 w-44" />
        </>
      )}
    </div>
  );
}
