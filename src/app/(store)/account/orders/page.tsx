import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AccountEmpty,
  AccountPageHeader,
  AccountStatus,
} from "@/components/store/account-shell";
import { getOrdersForUser } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import { formatLkr, isSupabaseConfigured } from "@/lib/utils-commerce";

export const metadata = { title: "Orders · Account" };

function statusTone(status: string): "amber" | "muted" | "ok" {
  if (status === "delivered") return "ok";
  if (status === "cancelled" || status === "refunded") return "muted";
  return "amber";
}

export default async function AccountOrdersPage() {
  if (!isSupabaseConfigured()) redirect("/account");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/orders");

  const orders = await getOrdersForUser(user.id);

  return (
    <div>
      <AccountPageHeader
        title="Orders"
        description="Track purchases and open any order for details."
      />

      {orders.length === 0 ? (
        <AccountEmpty actionHref="/shop" actionLabel="Shop fragrances">
          No orders yet.
        </AccountEmpty>
      ) : (
        <ul className="border border-border/60 bg-secondary/20">
          {orders.map((order) => (
            <li key={order.id} className="not-first:border-t not-first:border-border/50">
              <Link
                href={`/orders/${order.id}`}
                className="flex min-h-12 flex-col gap-1 px-4 py-3.5 transition hover:bg-secondary/40 sm:min-h-14 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-4"
              >
                <div className="flex min-w-0 items-baseline justify-between gap-3 sm:contents">
                  <div className="min-w-0">
                    <p className="font-medium">{order.order_number}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <AccountStatus tone={statusTone(order.status)}>
                        {order.status.replaceAll("_", " ")}
                      </AccountStatus>
                      {order.tracking_number ? (
                        <span className="text-xs text-muted-foreground">
                          Tracking {order.tracking_number}
                        </span>
                      ) : null}
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-LK", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="shrink-0 tabular-nums font-medium sm:ml-auto">
                    {formatLkr(Number(order.total_lkr))}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
