import { Skeleton } from "@/components/ui/skeleton";

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
