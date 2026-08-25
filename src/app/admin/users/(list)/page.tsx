import Link from "next/link";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  adminRowActionClass,
} from "@/components/admin/layout/admin-shell";
import { AdminStatus } from "@/components/admin/layout/admin-status";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { getAdminUsersPage } from "@/lib/admin";
import { formatLkr } from "@/lib/commerce";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { isDemoMode } from "@/lib/supabase/env";

export const metadata = { title: "Users · Admin" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if (isDemoMode()) {
    return (
      <div>
        <AdminPageHeader
          title="Users"
          description="Connect Supabase to view user accounts."
        />
      </div>
    );
  }

  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);
  const result = await getAdminUsersPage(page, PAGE_SIZE.admin);

  return (
    <div className="space-y-5 sm:space-y-8">
      <AdminPageHeader
        title="Users"
        description="All accounts with role, order count, and lifetime spend."
      />

      <AdminPanel>
        {result.items.length ? (
          <>
            <div id="results" className="scroll-mt-20">
            <ul className="divide-y divide-border/50 md:hidden">
              {result.items.map((p) => {
                const stats = { count: p.orderCount, total: p.lifetimeSpend };
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
                    <Link href={`/admin/users/${p.id}`} className={adminRowActionClass}>
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
                    <th className="px-3 py-2.5 text-right font-normal">LTV</th>
                    <th className="px-3 py-2.5 text-right font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {result.items.map((p) => {
                    const stats = { count: p.orderCount, total: p.lifetimeSpend };
                    return (
                      <tr key={p.id}>
                        <td className="px-3 py-2 font-medium">
                          {p.full_name || "—"}
                        </td>
                        <td className="max-w-56 truncate px-3 py-2 text-muted-foreground">
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
                            href={`/admin/users/${p.id}`}
                            className={adminRowActionClass}
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
            </div>
            <PaginationNav
              page={result.page}
              pageCount={result.pageCount}
              total={result.total}
              pageSize={result.pageSize}
              pathname="/admin/users"
              compact
            />
          </>
        ) : (
          <AdminEmpty>No users yet</AdminEmpty>
        )}
      </AdminPanel>
    </div>
  );
}
