import { Skeleton } from "@/components/ui/skeleton";
import {
  BrandTileSkeleton,
  SectionHeaderSkeleton,
} from "@/components/store/skeletons/primitives";

export function HomeSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading home">
      <section className="relative min-h-svh overflow-hidden bg-secondary/20">
        <Skeleton className="absolute inset-0 rounded-none opacity-40" />
        <div className="relative z-10 flex min-h-svh flex-col justify-between gap-10 px-4 pb-14 pt-28 sm:gap-12 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8 lg:pb-24 lg:pt-36">
          <div className="mx-auto w-full max-w-7xl lg:pl-10 xl:pl-14">
            <Skeleton className="mb-4 h-3 w-40 lg:hidden" />
            <Skeleton className="mb-6 h-px w-16 sm:mb-8 sm:w-24" />
            <Skeleton className="h-12 w-56 sm:h-16 sm:w-80 lg:h-20 lg:w-96" />
            <Skeleton className="mt-3 h-12 w-48 sm:h-16 sm:w-72 lg:h-20 lg:w-80" />
            <Skeleton className="mt-3 h-12 w-40 sm:h-16 sm:w-64 lg:h-20 lg:w-72" />
          </div>
          <div className="mx-auto w-full max-w-7xl lg:pl-10 xl:pl-14">
            <Skeleton className="h-4 w-64 max-w-full" />
            <div className="mt-8 flex gap-3 sm:mt-10">
              <Skeleton className="h-12 w-36" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </section>

      <div className="border-y border-border/40 py-5">
        <div className="flex gap-8 overflow-hidden px-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-4 w-24 shrink-0" />
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid gap-10 md:grid-cols-2 md:gap-14">
          <div className="space-y-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-56" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-3/4 max-w-sm" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex gap-4 border-b border-border/40 pb-4">
                <Skeleton className="size-8 shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeaderSkeleton />
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10">
          <Skeleton className="aspect-4/5 w-full max-w-xs sm:max-w-sm md:max-w-md" />
          <div className="space-y-4">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-10 w-56" />
            <Skeleton className="h-4 w-full max-w-sm" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-4 h-11 w-36" />
          </div>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-0 *:border-r *:border-b *:border-border/40 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="aspect-4/5 w-full rounded-none" />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeaderSkeleton />
        <div className="grid grid-cols-2 *:border-r *:border-b *:border-border/40 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <BrandTileSkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeaderSkeleton />
        <div className="grid grid-cols-2 *:border-r *:border-b *:border-border/40 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="aspect-4/5 w-full rounded-none" />
          ))}
        </div>
      </section>

      <section className="border-t border-border/40 bg-secondary/20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-10 w-64 max-w-full" />
          <Skeleton className="mt-4 h-4 w-80 max-w-full" />
          <div className="mt-8 flex max-w-md gap-2">
            <Skeleton className="h-11 flex-1" />
            <Skeleton className="h-11 w-28" />
          </div>
        </div>
      </section>
    </div>
  );
}
