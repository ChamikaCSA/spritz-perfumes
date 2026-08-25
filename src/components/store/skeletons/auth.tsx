import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
