import { Skeleton } from "@/components/ui/skeleton";
import {
  ProductGridSkeleton,
  SectionHeaderSkeleton,
} from "@/components/store/skeletons/primitives";

export function ProductSkeleton() {
  return (
    <div className="pb-14 sm:pb-20 lg:pb-24" aria-busy="true" aria-label="Loading product">
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-28">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-8 xl:gap-12">
          <Skeleton className="aspect-square w-full sm:aspect-4/5 lg:max-h-[calc(100svh-11rem)]" />
          <div className="flex min-w-0 flex-col">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-10 w-3/4 sm:h-14" />
            <Skeleton className="mt-4 h-4 w-40" />
            <div className="mt-6 space-y-2 sm:mt-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="mt-8 space-y-3">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeaderSkeleton />
        <ProductGridSkeleton count={4} className="md:grid-cols-4" />
      </div>
    </div>
  );
}
