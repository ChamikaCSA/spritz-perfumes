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
      </div>
    </div>
  );
}

function SectionHeaderSkeleton() {
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

export function HomeSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading home">
      <section className="relative min-h-svh overflow-hidden bg-secondary/20">
        <Skeleton className="absolute inset-0 rounded-none opacity-40" />
        <div className="relative z-10 flex min-h-svh flex-col justify-end px-4 pb-14 pt-28 sm:px-6 sm:pb-20 lg:justify-center lg:px-8 lg:pb-24 lg:pt-32">
          <div className="mx-auto w-full max-w-7xl lg:pl-10 xl:pl-14">
            <Skeleton className="mb-6 h-px w-16 sm:mb-8 sm:w-24" />
            <Skeleton className="h-12 w-56 sm:h-16 sm:w-80 lg:h-20 lg:w-96" />
            <Skeleton className="mt-3 h-12 w-48 sm:h-16 sm:w-72 lg:h-20 lg:w-80" />
            <Skeleton className="mt-3 h-12 w-40 sm:h-16 sm:w-64 lg:h-20 lg:w-72" />
            <Skeleton className="mt-8 h-4 w-64 max-w-full sm:mt-10" />
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
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
          <Skeleton className="aspect-4/5 w-full max-w-sm md:max-w-none" />
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
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeaderSkeleton />
        <div className="grid grid-cols-2 *:border-r *:border-b *:border-border/40 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <BrandTileSkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeaderSkeleton />
        <ProductGridSkeleton count={4} className="md:grid-cols-4" />
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

export function ShopSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pt-32"
      aria-busy="true"
      aria-label="Loading shop"
    >
      <PageHeaderSkeleton />
      <ShopToolbarSkeleton />
      <ProductGridSkeleton count={6} className="lg:grid-cols-3" />
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="pb-14 sm:pb-20 lg:pb-24" aria-busy="true" aria-label="Loading product">
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12 xl:gap-16">
          <Skeleton className="aspect-4/5 w-full" />
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

export function BrandsSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pt-32"
      aria-busy="true"
      aria-label="Loading brands"
    >
      <PageHeaderSkeleton className="mb-6 sm:mb-10 lg:mb-12" />
      <div className="grid grid-cols-2 *:border-r *:border-b *:border-border/40 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
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
          count={8}
          className="md:grid-cols-3 lg:grid-cols-4"
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
        count={8}
        className="md:grid-cols-3 lg:grid-cols-4"
      />
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div
      className="mx-auto max-w-3xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28"
      aria-busy="true"
      aria-label="Loading checkout"
    >
      <Skeleton className="h-10 w-48 sm:h-12" />
      <div className="mt-4 flex flex-wrap gap-2 sm:mt-6">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-7 w-20" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:mt-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <div className="space-y-3">
          <Skeleton className="h-7 w-40" />
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
          <Skeleton className="mt-4 h-11 w-28" />
        </div>
        <div className="space-y-3 border border-border/60 bg-secondary/20 p-5">
          <Skeleton className="h-5 w-24" />
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex justify-between gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
          <Skeleton className="mt-2 h-5 w-full" />
        </div>
      </div>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div
      className="mx-auto max-w-2xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28"
      aria-busy="true"
      aria-label="Loading order"
    >
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-9 w-56 sm:h-12 sm:w-72" />
      <Skeleton className="mt-4 h-4 w-full max-w-md" />
      <div className="mt-10 space-y-0 border border-border/60">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 px-4 py-4 not-first:border-t not-first:border-border/50 sm:px-6"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-16 shrink-0" />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
}

export function AccountShellSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-7xl overflow-x-clip px-4 pb-[max(3rem,env(safe-area-inset-bottom))] pt-20 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8 lg:pt-32"
      aria-busy="true"
      aria-label="Loading account"
    >
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-border/50 pb-4 sm:mb-6 sm:pb-6 lg:mb-8 lg:pb-8">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-48 sm:h-10 sm:w-64" />
          <Skeleton className="h-3.5 w-40" />
        </div>
        <Skeleton className="h-9 w-20 shrink-0" />
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
        <aside className="min-w-0 border-b border-border/40 pb-4 lg:border-b-0 lg:pb-0">
          <div className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-24 shrink-0 lg:w-full" />
            ))}
          </div>
        </aside>
        <AccountOverviewContentSkeleton />
      </div>
    </div>
  );
}

export function AccountPageHeaderSkeleton() {
  return (
    <div className="mb-5 sm:mb-6">
      <Skeleton className="h-7 w-32 sm:h-8 sm:w-40" />
      <Skeleton className="mt-2 h-4 w-56 max-w-full" />
    </div>
  );
}

export function AccountOverviewContentSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-8">
      <AccountPageHeaderSkeleton />
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="border border-border/60 bg-secondary/20 p-3 sm:p-5"
          >
            <Skeleton className="h-3 w-14" />
            <Skeleton className="mt-3 h-8 w-10 sm:h-10" />
          </div>
        ))}
      </div>
      <div className="border border-border/60 bg-secondary/20 p-4 sm:p-6">
        <Skeleton className="h-5 w-28" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <div className="border border-border/60">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 px-4 py-3.5 not-first:border-t not-first:border-border/50 sm:px-6"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AccountOrdersContentSkeleton() {
  return (
    <div>
      <AccountPageHeaderSkeleton />
      <ul className="border border-border/60 bg-secondary/20">
        {Array.from({ length: 4 }, (_, i) => (
          <li
            key={i}
            className="flex flex-col gap-2 px-4 py-3.5 not-first:border-t not-first:border-border/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-4 w-16" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AccountListContentSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div>
      <AccountPageHeaderSkeleton />
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            className="border border-border/60 bg-secondary/20 p-4 sm:p-5"
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AccountProfileContentSkeleton() {
  return (
    <div className="space-y-6">
      <AccountPageHeaderSkeleton />
      <div className="border border-border/60 bg-secondary/20 p-4 sm:p-6">
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-11 w-full" />
            </div>
          ))}
          <Skeleton className="mt-2 h-11 w-28" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 2 }, (_, i) => (
          <div
            key={i}
            className="border border-border/60 bg-secondary/20 p-4 sm:p-5"
          >
            <Skeleton className="h-4 w-36" />
            <Skeleton className="mt-2 h-3 w-48" />
            <Skeleton className="mt-2 h-3 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuthFormSkeleton({ titleWidth = "w-36" }: { titleWidth?: string }) {
  return (
    <div
      className="mx-auto max-w-md px-4 py-16 sm:py-36"
      aria-busy="true"
      aria-label="Loading"
    >
      <Skeleton className={cn("h-10 sm:h-12", titleWidth)} />
      <Skeleton className="mt-3 h-4 w-56 max-w-full" />
      <div className="mt-6 space-y-4 sm:mt-8">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
      <Skeleton className="mt-6 h-4 w-40" />
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
