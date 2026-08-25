import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function AdminPageHeaderSkeleton({
  withAction = false,
  className,
}: {
  withAction?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-5 flex min-w-0 flex-col gap-3 sm:mb-7 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0 space-y-2">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-8 w-40 sm:h-10 sm:w-52 lg:h-12 lg:w-64" />
        <Skeleton className="h-4 w-64 max-w-full sm:w-80" />
      </div>
      {withAction ? <Skeleton className="h-11 w-32 shrink-0" /> : null}
    </div>
  );
}

function AdminStatSkeleton() {
  return (
    <div className="border border-border/60 bg-secondary/20 p-3 sm:p-5">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-3 h-7 w-20 sm:h-9 sm:w-24" />
    </div>
  );
}

function AdminListRowSkeleton({
  withThumb = false,
}: {
  withThumb?: boolean;
}) {
  return (
    <li className="flex items-center gap-2 px-0 py-2 sm:gap-3 sm:py-2.5">
      {withThumb ? (
        <Skeleton className="size-9 shrink-0 sm:size-10" />
      ) : null}
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-4 w-40 max-w-full sm:w-56" />
        <Skeleton className="h-3 w-28 sm:w-36" />
      </div>
      <Skeleton className="h-4 w-14 shrink-0" />
    </li>
  );
}

function AdminTableSkeleton({
  columns = 5,
  rows = 6,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border/60">
          <tr>
            {Array.from({ length: columns }, (_, i) => (
              <th key={i} className="px-3 py-2.5">
                <Skeleton className="h-3 w-14" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {Array.from({ length: rows }, (_, i) => (
            <tr key={i}>
              {Array.from({ length: columns }, (_, j) => (
                <td key={j} className="px-3 py-2.5">
                  <Skeleton
                    className={cn(
                      "h-4",
                      j === columns - 1 ? "ml-auto w-10" : "w-20",
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminPanelListSkeleton({
  rows = 6,
  withThumb = false,
  withTable = false,
  tableColumns = 5,
  title,
}: {
  rows?: number;
  withThumb?: boolean;
  withTable?: boolean;
  tableColumns?: number;
  title?: boolean;
}) {
  return (
    <section className="min-w-0 border border-border/60 bg-secondary/20 p-4 sm:p-6">
      {title ? (
        <div className="mb-4 sm:mb-5">
          <Skeleton className="h-7 w-32 sm:h-8 sm:w-40" />
        </div>
      ) : null}
      <ul className={cn("divide-y divide-border/50", withTable && "md:hidden")}>
        {Array.from({ length: rows }, (_, i) => (
          <AdminListRowSkeleton key={i} withThumb={withThumb} />
        ))}
      </ul>
      {withTable ? (
        <AdminTableSkeleton columns={tableColumns} rows={rows} />
      ) : null}
    </section>
  );
}

export function AdminOverviewSkeleton() {
  return (
    <div
      className="space-y-5 sm:space-y-8"
      aria-busy="true"
      aria-label="Loading overview"
    >
      <AdminPageHeaderSkeleton />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <AdminStatSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <AdminStatSkeleton key={i} />
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 border border-border/60 bg-secondary/10 px-3 py-2.5 sm:px-4 sm:py-3"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-8" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="border border-border/60 bg-secondary/20 p-4 sm:p-6">
          <Skeleton className="mb-5 h-7 w-36" />
          <Skeleton className="h-48 w-full sm:h-56" />
        </section>
        <section className="border border-border/60 bg-secondary/20 p-4 sm:p-6">
          <Skeleton className="mb-5 h-7 w-28" />
          <Skeleton className="h-48 w-full sm:h-56" />
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <AdminPanelListSkeleton rows={5} title />
        <AdminPanelListSkeleton rows={5} title />
      </div>
    </div>
  );
}

export function AdminOrdersSkeleton() {
  return (
    <div
      className="space-y-5 sm:space-y-8"
      aria-busy="true"
      aria-label="Loading orders"
    >
      <AdminPageHeaderSkeleton />
      <AdminPanelListSkeleton rows={8} withTable tableColumns={6} />
    </div>
  );
}

export function AdminProductsSkeleton() {
  return (
    <div
      className="space-y-5 sm:space-y-8"
      aria-busy="true"
      aria-label="Loading products"
    >
      <AdminPageHeaderSkeleton withAction />
      <AdminPanelListSkeleton rows={8} withThumb />
    </div>
  );
}

export function AdminBrandsSkeleton() {
  return (
    <div
      className="space-y-5 sm:space-y-8"
      aria-busy="true"
      aria-label="Loading brands"
    >
      <AdminPageHeaderSkeleton withAction />
      <AdminPanelListSkeleton rows={6} withThumb />
    </div>
  );
}

export function AdminUsersSkeleton() {
  return (
    <div
      className="space-y-5 sm:space-y-8"
      aria-busy="true"
      aria-label="Loading users"
    >
      <AdminPageHeaderSkeleton />
      <AdminPanelListSkeleton rows={8} withTable tableColumns={5} />
    </div>
  );
}

export function AdminUserDetailSkeleton() {
  return (
    <div
      className="space-y-5 sm:space-y-8"
      aria-busy="true"
      aria-label="Loading user"
    >
      <AdminPageHeaderSkeleton />
      <AdminPanelListSkeleton rows={4} title />
      <AdminPanelListSkeleton rows={2} title />
    </div>
  );
}

export function AdminOrderDetailSkeleton() {
  return (
    <div
      className="space-y-5 sm:space-y-8"
      aria-busy="true"
      aria-label="Loading order"
    >
      <AdminPageHeaderSkeleton />
      <section className="min-w-0 border border-border/60 bg-secondary/20 p-4 sm:p-6">
        <Skeleton className="mb-5 h-7 w-28 sm:h-8 sm:w-36" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
          <Skeleton className="h-11 w-32" />
        </div>
      </section>
      <AdminPanelListSkeleton rows={3} title />
      <AdminPanelListSkeleton rows={4} title />
      <section className="min-w-0 border border-border/60 bg-secondary/20 p-4 sm:p-6">
        <Skeleton className="mb-5 h-7 w-28 sm:h-8 sm:w-36" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-28" />
        </div>
      </section>
    </div>
  );
}

export function AdminInventorySkeleton() {
  return (
    <div
      className="space-y-5 sm:space-y-8"
      aria-busy="true"
      aria-label="Loading inventory"
    >
      <AdminPageHeaderSkeleton withAction />
      <AdminPanelListSkeleton rows={8} />
      <AdminPanelListSkeleton rows={5} title />
    </div>
  );
}

export function AdminReviewsSkeleton() {
  return (
    <div
      className="space-y-5 sm:space-y-8"
      aria-busy="true"
      aria-label="Loading reviews"
    >
      <AdminPageHeaderSkeleton />
      <AdminPanelListSkeleton rows={4} title />
      <AdminPanelListSkeleton rows={4} title />
    </div>
  );
}

export function AdminDocumentSkeleton({
  label = "Loading document",
}: {
  label?: string;
}) {
  return (
    <div
      className="mx-auto max-w-2xl space-y-6 p-6 sm:p-10"
      aria-busy="true"
      aria-label={label}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="space-y-0 border border-border/60">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="flex justify-between gap-4 px-4 py-3 not-first:border-t not-first:border-border/50"
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
