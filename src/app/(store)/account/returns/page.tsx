import { redirect } from "next/navigation";
import { createReturnRequest } from "@/actions/store";
import {
  AccountEmpty,
  AccountPageHeader,
  AccountPanel,
  AccountStatus,
  accountButtonClass,
  accountFieldClass,
  accountTextareaClass,
} from "@/components/store/account-shell";
import { getOrdersForUser } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils-commerce";

export const metadata = { title: "Returns · Account" };

export default async function AccountReturnsPage() {
  if (!isSupabaseConfigured()) redirect("/account");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/returns");

  const orders = await getOrdersForUser(user.id);
  const returnable = orders.filter((o) =>
    ["paid", "packing", "shipped", "delivered"].includes(o.status),
  );
  const { data: returns } = await supabase
    .from("return_requests")
    .select("*, orders(order_number)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const list = returns ?? [];

  return (
    <div className="space-y-5 sm:space-y-8">
      <AccountPageHeader
        title="Returns"
        description="Request a return on an eligible order and track status here."
      />

      <AccountPanel title="Request a return">
        {returnable.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No eligible orders right now. Returns open after payment clears.
          </p>
        ) : (
          <form action={createReturnRequest} className="space-y-3">
            <select
              name="order_id"
              required
              className={accountFieldClass}
              defaultValue=""
            >
              <option value="" disabled>
                Select order
              </option>
              {returnable.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.order_number} · {o.status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <textarea
              name="reason"
              required
              placeholder="Reason for return"
              className={accountTextareaClass}
            />
            <button type="submit" className={`${accountButtonClass} w-full sm:w-auto`}>
              Submit request
            </button>
          </form>
        )}
      </AccountPanel>

      <AccountPanel title="Your requests">
        {list.length === 0 ? (
          <AccountEmpty>No return requests yet.</AccountEmpty>
        ) : (
          <ul className="divide-y divide-border/50">
            {list.map((r) => {
              const order = r.orders as { order_number: string } | null;
              return (
                <li key={r.id} className="py-3 first:pt-0 last:pb-0 sm:py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">
                      {order?.order_number ?? "Order"}
                    </p>
                    <AccountStatus tone="amber">{r.status}</AccountStatus>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2">
                    {r.reason}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </AccountPanel>
    </div>
  );
}
