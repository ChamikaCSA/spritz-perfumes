import Link from "next/link";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  adminTextLinkClass,
} from "@/components/admin/admin-shell";
import { AdminStatus, orderStatusTone } from "@/components/admin/admin-status";
import { createClient } from "@/lib/supabase/server";
import { formatLkr, isSupabaseConfigured } from "@/lib/utils-commerce";
import { notFound } from "next/navigation";

type Params = Promise<{ id: string }>;

export default async function AdminUserDetailPage({
  params,
}: {
  params: Params;
}) {
  if (!isSupabaseConfigured()) notFound();
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: profile }, { data: orders }, { data: addresses }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("orders")
        .select("id, order_number, status, total_lkr, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false }),
      supabase.from("addresses").select("*").eq("user_id", id),
    ]);
  if (!profile) notFound();

  return (
    <div className="space-y-5 sm:space-y-8">
      <AdminPageHeader
        title={profile.full_name || profile.email || "User"}
        description={`${profile.email} · ${profile.phone || "No phone"} · ${profile.role}`}
      />

      <AdminPanel title="Orders">
        {(orders ?? []).length ? (
          <ul className="divide-y divide-border/50">
            {(orders ?? []).map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between gap-2 py-2 text-sm sm:gap-3 sm:py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className={adminTextLinkClass}
                  >
                    {o.order_number}
                  </Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                    <AdminStatus tone={orderStatusTone(o.status)}>
                      {o.status.replaceAll("_", " ")}
                    </AdminStatus>
                    <span className="tabular-nums">
                      {new Date(o.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="shrink-0 tabular-nums text-sm text-amber">
                  {formatLkr(Number(o.total_lkr))}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <AdminEmpty>No orders</AdminEmpty>
        )}
      </AdminPanel>

      <AdminPanel title="Addresses">
        {(addresses ?? []).length ? (
          <ul className="divide-y divide-border/40">
            {(addresses ?? []).map((a) => (
              <li key={a.id} className="px-0 py-2 text-sm sm:py-2.5">
                <p className="truncate text-sm font-medium">
                  {a.label}
                  {a.is_default ? (
                    <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-amber">
                      Default
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {a.first_name} {a.last_name} · {a.phone} · {a.address_line1},{" "}
                  {a.city}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <AdminEmpty>No saved addresses</AdminEmpty>
        )}
      </AdminPanel>
    </div>
  );
}
