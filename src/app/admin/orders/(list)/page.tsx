import Link from "next/link";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  adminRowActionClass,
} from "@/components/admin/admin-shell";
import { AdminStatus, orderStatusTone } from "@/components/admin/admin-status";
import { PaginationNav } from "@/components/store/pagination-nav";
import { PAGE_SIZE, pageFromTotal, pageRange, parsePage } from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import { formatLkr, isSupabaseConfigured } from "@/lib/utils-commerce";

export const metadata = { title: "Orders · Admin" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div>
        <AdminPageHeader
          title="Orders"
          description="Connect Supabase and PayHere to manage live orders."
        />
      </div>
    );
  }

  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);
  const { from, to } = pageRange(page, PAGE_SIZE.admin);
  const supabase = await createClient();
  const { data: orders, count } = await supabase
    .from("orders")
    .select(
      "id, order_number, first_name, last_name, status, total_lkr, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);
  const result = pageFromTotal(orders ?? [], count ?? 0, page, PAGE_SIZE.admin);

  return (
    <div className="space-y-5 sm:space-y-8">
      <AdminPageHeader
        title="Orders"
        description="Open an order to view details and update fulfillment."
      />

      <AdminPanel>
        {result.items.length ? (
          <>
            <div id="results" className="scroll-mt-20">
            <ul className="divide-y divide-border/50 md:hidden">
              {result.items.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center gap-2 px-0 py-2 sm:gap-3 sm:py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium tabular-nums">
                      {order.order_number}
                      <span className="mx-1.5 font-normal text-border">·</span>
                      <span className="font-normal text-muted-foreground">
                        {order.first_name} {order.last_name}
                      </span>
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                      <AdminStatus tone={orderStatusTone(order.status)}>
                        {order.status.replaceAll("_", " ")}
                      </AdminStatus>
                      <span className="tabular-nums">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <p className="tabular-nums text-sm text-amber">
                      {formatLkr(Number(order.total_lkr))}
                    </p>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className={adminRowActionClass}
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border/60 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5 font-normal">Order</th>
                    <th className="px-3 py-2.5 font-normal">User</th>
                    <th className="px-3 py-2.5 font-normal">Status</th>
                    <th className="px-3 py-2.5 font-normal text-right">Total</th>
                    <th className="px-3 py-2.5 text-right font-normal">Date</th>
                    <th className="px-3 py-2.5 text-right font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {result.items.map((order) => (
                    <tr key={order.id}>
                      <td className="px-3 py-2 font-medium tabular-nums">
                        {order.order_number}
                      </td>
                      <td className="max-w-48 truncate px-3 py-2 text-muted-foreground">
                        {order.first_name} {order.last_name}
                      </td>
                      <td className="px-3 py-2">
                        <AdminStatus tone={orderStatusTone(order.status)}>
                          {order.status.replaceAll("_", " ")}
                        </AdminStatus>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-amber">
                        {formatLkr(Number(order.total_lkr))}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className={adminRowActionClass}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
            <PaginationNav
              page={result.page}
              pageCount={result.pageCount}
              total={result.total}
              pageSize={result.pageSize}
              pathname="/admin/orders"
              compact
            />
          </>
        ) : (
          <AdminEmpty>No orders yet</AdminEmpty>
        )}
      </AdminPanel>
    </div>
  );
}
