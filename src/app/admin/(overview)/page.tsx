import Link from "next/link";
import { AdminCharts } from "@/components/admin/admin-charts";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  AdminStat,
} from "@/components/admin/admin-shell";
import { AdminStatus, orderStatusTone } from "@/components/admin/admin-status";
import { createClient } from "@/lib/supabase/server";
import { formatLkr, isSupabaseConfigured } from "@/lib/utils-commerce";
import { DEMO_PRODUCTS } from "@/lib/demo-data";

export const metadata = { title: "Admin" };

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminOverviewPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div>
        <AdminPageHeader
          title="Overview"
          description={`Connect Supabase to unlock live admin metrics. Demo catalog has ${DEMO_PRODUCTS.length} products.`}
        />
      </div>
    );
  }

  const supabase = await createClient();
  const today = startOfDay().toISOString();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const since30 = daysAgo(30).toISOString();

  const [
    { count: productCount },
    { count: orderCount },
    { count: customerCount },
    { count: sealedCount },
    { count: pendingPaymentCount },
    { count: attentionOrderCount },
    { count: pendingReviewCount },
    { data: paidToday },
    { data: paidMonth },
    { data: recentOrders },
    { data: orders30 },
    { data: orderItems },
    { data: lots },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("inventory_lots")
      .select("*", { count: "exact", head: true })
      .eq("status", "sealed"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_payment"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending_payment", "paid", "packing"]),
    supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("is_approved", false),
    supabase
      .from("orders")
      .select("total_lkr")
      .gte("created_at", today)
      .in("status", ["paid", "packing", "shipped", "delivered"]),
    supabase
      .from("orders")
      .select("total_lkr")
      .gte("created_at", monthStart.toISOString())
      .in("status", ["paid", "packing", "shipped", "delivered"]),
    supabase
      .from("orders")
      .select("id, order_number, status, total_lkr, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("orders")
      .select("created_at, total_lkr, status")
      .gte("created_at", since30),
    supabase
      .from("order_items")
      .select("brand_name, line_total_lkr, product_name, quantity"),
    supabase
      .from("inventory_lots")
      .select("product_id, status, remaining_ml, products(name)"),
  ]);

  const todaySales = (paidToday ?? []).reduce(
    (s, o) => s + Number(o.total_lkr),
    0,
  );
  const monthlyRevenue = (paidMonth ?? []).reduce(
    (s, o) => s + Number(o.total_lkr),
    0,
  );

  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = daysAgo(i);
    const key = d.toISOString().slice(5, 10);
    byDay.set(key, { revenue: 0, orders: 0 });
  }
  for (const o of orders30 ?? []) {
    if (!["paid", "packing", "shipped", "delivered"].includes(o.status)) continue;
    const key = String(o.created_at).slice(5, 10);
    const cur = byDay.get(key) ?? { revenue: 0, orders: 0 };
    cur.revenue += Number(o.total_lkr);
    cur.orders += 1;
    byDay.set(key, cur);
  }
  const revenueSeries = [...byDay.entries()].map(([day, v]) => ({
    day,
    revenue: Math.round(v.revenue),
    orders: v.orders,
  }));

  const brandTotals = new Map<string, number>();
  for (const item of orderItems ?? []) {
    const brand = (item as { brand_name: string }).brand_name;
    brandTotals.set(
      brand,
      (brandTotals.get(brand) ?? 0) +
        Number((item as { line_total_lkr: number }).line_total_lkr),
    );
  }
  const brandSeries = [...brandTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([brand, total]) => ({ brand, total: Math.round(total) }));

  const bestSellers = [...(orderItems ?? [])].reduce((map, item) => {
    const name = (item as { product_name: string }).product_name;
    const qty = Number((item as { quantity: number }).quantity);
    map.set(name, (map.get(name) ?? 0) + qty);
    return map;
  }, new Map<string, number>());
  const topProducts = [...bestSellers.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const lowStock = (lots ?? []).filter((lot) => {
    const status = lot.status as string;
    const rem = Number(lot.remaining_ml);
    return status === "open" && rem > 0 && rem < 10;
  });

  return (
    <div className="space-y-5 sm:space-y-8">
      <AdminPageHeader
        title="Overview"
        description="Sales, inventory health, and recent orders."
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
        <AdminStat
          label="Today's sales"
          value={formatLkr(todaySales)}
          tone="amber"
        />
        <AdminStat
          label="Monthly revenue"
          value={formatLkr(monthlyRevenue)}
          tone="amber"
        />
        <AdminStat
          label="Needs attention"
          value={String(attentionOrderCount ?? 0)}
          href="/admin/orders"
          tone="amber"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <AdminStat label="Products" value={String(productCount ?? 0)} />
        <AdminStat label="Sealed bottles" value={String(sealedCount ?? 0)} />
        <AdminStat label="Customers" value={String(customerCount ?? 0)} />
      </div>

      <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
        <AttentionLink
          href="/admin/inventory"
          label="Low stock lots"
          value={lowStock.length}
        />
        <AttentionLink
          href="/admin/orders"
          label="Pending payment"
          value={pendingPaymentCount ?? 0}
        />
        <AttentionLink
          href="/admin/reviews"
          label="Pending reviews"
          value={pendingReviewCount ?? 0}
        />
      </div>

      <AdminCharts revenueSeries={revenueSeries} brandSeries={brandSeries} />

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <AdminPanel title="Best sellers">
          {topProducts.length ? (
            <ul className="space-y-2 text-sm">
              {topProducts.map(([name, qty]) => (
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
            <Link
              href="/admin/orders"
              className="inline-flex min-h-9 items-center text-[11px] uppercase tracking-[0.16em] text-amber sm:min-h-11 sm:text-xs"
            >
              View all
            </Link>
          }
        >
          {(recentOrders ?? []).length ? (
            <ul className="divide-y divide-border/60">
              {(recentOrders ?? []).map((o) => (
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
        {orderCount ?? 0} orders total
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
