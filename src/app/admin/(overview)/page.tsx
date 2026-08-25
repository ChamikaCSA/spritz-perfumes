import Link from "next/link";
import { AdminCharts } from "@/components/admin/layout/admin-charts";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  AdminStat,
  adminTextLinkClass,
} from "@/components/admin/layout/admin-shell";
import { AdminStatus, orderStatusTone } from "@/components/admin/layout/admin-status";
import { getAdminOverview } from "@/lib/admin/overview";
import { formatLkr } from "@/lib/commerce";

export const metadata = { title: "Admin" };

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview();

  if (overview.demo) {
    return (
      <div>
        <AdminPageHeader
          title="Overview"
          description={`Connect Supabase to unlock live admin metrics. Demo catalog has ${overview.demoProductCount} products.`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8">
      <AdminPageHeader
        title="Overview"
        description="Sales, inventory health, and recent orders."
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
        <AdminStat
          label="Today's sales"
          value={formatLkr(overview.todaySales)}
          tone="amber"
        />
        <AdminStat
          label="Monthly revenue"
          value={formatLkr(overview.monthlyRevenue)}
          tone="amber"
        />
        <AdminStat
          label="Needs attention"
          value={String(overview.attentionOrderCount)}
          href="/admin/orders"
          tone="amber"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <AdminStat label="Products" value={String(overview.productCount)} />
        <AdminStat label="Sealed bottles" value={String(overview.sealedCount)} />
        <AdminStat label="Users" value={String(overview.userCount)} />
      </div>

      <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
        <AttentionLink
          href="/admin/inventory"
          label="Low stock lots"
          value={overview.lowStockCount}
        />
        <AttentionLink
          href="/admin/orders"
          label="Pending payment"
          value={overview.pendingPaymentCount}
        />
        <AttentionLink
          href="/admin/reviews"
          label="Pending reviews"
          value={overview.pendingReviewCount}
        />
      </div>

      <AdminCharts
        revenueSeries={overview.revenueSeries}
        brandSeries={overview.brandSeries}
      />

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <AdminPanel title="Best sellers">
          {overview.topProducts.length ? (
            <ul className="space-y-2 text-sm">
              {overview.topProducts.map(([name, qty]) => (
                <li key={name} className="flex justify-between gap-4">
                  <span className="min-w-0 truncate">{name}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {qty} sold
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <AdminEmpty>No sales yet</AdminEmpty>
          )}
        </AdminPanel>

        <AdminPanel
          title="Recent orders"
          action={
            <Link href="/admin/orders" className={adminTextLinkClass}>
              View all
            </Link>
          }
        >
          {overview.recentOrders.length ? (
            <ul className="divide-y divide-border/60">
              {overview.recentOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-2 py-2 text-sm sm:gap-3 sm:py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {o.order_number}
                    </p>
                    <div className="mt-0.5">
                      <AdminStatus tone={orderStatusTone(o.status)}>
                        {o.status.replaceAll("_", " ")}
                      </AdminStatus>
                    </div>
                  </div>
                  <span className="shrink-0 tabular-nums text-sm text-amber">
                    {formatLkr(Number(o.total_lkr))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <AdminEmpty>No orders yet</AdminEmpty>
          )}
        </AdminPanel>
      </div>

      <p className="text-xs text-muted-foreground">
        {overview.orderCount} orders total
      </p>
    </div>
  );
}

function AttentionLink({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 border border-border/60 bg-secondary/10 px-3 py-2.5 transition hover:border-amber/40 sm:px-4 sm:py-3"
    >
      <span className="min-w-0 truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px] sm:tracking-[0.16em]">
        {label}
      </span>
      <span className="shrink-0 font-display text-lg tabular-nums text-amber sm:text-xl">
        {value}
      </span>
    </Link>
  );
}
