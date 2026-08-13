import { redirect } from "next/navigation";
import { AccountReturnForm } from "@/components/store/account-return-form";
import {
  AccountEmpty,
  AccountPageHeader,
  AccountStatus,
} from "@/components/store/account-shell";
import { PaginationNav } from "@/components/store/pagination-nav";
import { getReturnableOrdersForUser } from "@/lib/catalog";
import { PAGE_SIZE, pageFromTotal, pageRange, parsePage } from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils-commerce";

export const metadata = { title: "Returns · Account" };

export default async function AccountReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if (!isSupabaseConfigured()) redirect("/account");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/returns");

  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);
  const { from, to } = pageRange(page, PAGE_SIZE.account);
  const returnable = await getReturnableOrdersForUser(user.id);
  const { data: returns, count } = await supabase
    .from("return_requests")
    .select("*, orders(order_number)", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  const result = pageFromTotal(returns ?? [], count ?? 0, page, PAGE_SIZE.account);
  const list = result.items;

  return (
    <div className="space-y-5 sm:space-y-8">
      <AccountPageHeader
        title="Returns"
        description="Request a return on an eligible order and track status here."
      />

      <AccountReturnForm orders={returnable}>
        {list.length === 0 ? (
          <AccountEmpty>No return requests yet.</AccountEmpty>
        ) : (
          <>
            <ul id="results" className="scroll-mt-24 divide-y divide-border/50">
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
            <PaginationNav
              page={result.page}
              pageCount={result.pageCount}
              total={result.total}
              pageSize={result.pageSize}
              pathname="/account/returns"
              compact
            />
          </>
        )}
      </AccountReturnForm>
    </div>
  );
}
