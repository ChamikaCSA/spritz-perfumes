import Link from "next/link";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/admin-shell";
import { AdminStatus } from "@/components/admin/admin-status";
import { createClient } from "@/lib/supabase/server";
import { formatLkr, isSupabaseConfigured } from "@/lib/utils-commerce";

export const metadata = { title: "Customers · Admin" };

export default async function AdminCustomersPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div>
        <AdminPageHeader
          title="Customers"
          description="Connect Supabase to view customers."
        />
      </div>
    );
  }

  const supabase = await createClient();
  const [{ data: profiles }, { data: orders }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("orders").select("user_id, total_lkr, status"),
  ]);

  const spend = new Map<string, { count: number; total: number }>();
  for (const o of orders ?? []) {
    if (!o.user_id) continue;
    if (!["paid", "packing", "shipped", "delivered"].includes(o.status))
      continue;
    const cur = spend.get(o.user_id) ?? { count: 0, total: 0 };
    cur.count += 1;
    cur.total += Number(o.total_lkr);
    spend.set(o.user_id, cur);
  }

  return (
    <div className="space-y-5 sm:space-y-8">
      <AdminPageHeader
        title="Customers"
        description="Profiles with order count and lifetime spend."
      />

      <AdminPanel>
        {(profiles ?? []).length ? (
          <>
            <ul className="divide-y divide-border/50 md:hidden">
              {(profiles ?? []).map((p) => {
                const stats = spend.get(p.id) ?? { count: 0, total: 0 };
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-2 px-0 py-2 sm:gap-3 sm:py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {p.full_name || "—"}
                        <span className="mx-1.5 font-normal text-border">
                          ·
                        </span>
                        <span className="font-normal text-muted-foreground">
                          {p.email}
                        </span>
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                        <AdminStatus
                          tone={p.role === "admin" ? "amber" : "muted"}
                        >
                          {p.role}
                        </AdminStatus>
                        <span className="tabular-nums">
                          {stats.count} orders · {formatLkr(stats.total)}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/customers/${p.id}`}
                      className="inline-flex min-h-9 shrink-0 items-center px-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-amber"
                    >
                      View
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border/60 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5 font-normal">Name</th>
                    <th className="px-3 py-2.5 font-normal">Email</th>
                    <th className="px-3 py-2.5 font-normal">Role</th>
                    <th className="px-3 py-2.5 font-normal text-right">Orders</th>
                    <th className="px-3 py-2.5 font-normal text-right">LTV</th>
                    <th className="px-3 py-2.5 font-normal" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {(profiles ?? []).map((p) => {
                    const stats = spend.get(p.id) ?? { count: 0, total: 0 };
                    return (
                      <tr key={p.id} className="hover:bg-secondary/20">
                        <td className="px-3 py-2 font-medium">
                          {p.full_name || "—"}
                        </td>
                        <td className="max-w-[14rem] truncate px-3 py-2 text-muted-foreground">
                          {p.email}
                        </td>
                        <td className="px-3 py-2">
                          <AdminStatus
                            tone={p.role === "admin" ? "amber" : "muted"}
                          >
                            {p.role}
                          </AdminStatus>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {stats.count}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-amber">
                          {formatLkr(stats.total)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Link
                            href={`/admin/customers/${p.id}`}
                            className="inline-flex min-h-9 items-center text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-amber"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <AdminEmpty>No customers yet</AdminEmpty>
        )}
      </AdminPanel>
    </div>
  );
}
