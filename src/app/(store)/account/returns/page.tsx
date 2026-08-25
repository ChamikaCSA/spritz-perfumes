import { AccountReturnForm } from "@/components/store/account/account-return-form";
import {
  AccountEmpty,
  AccountPageHeader,
  AccountStatus,
} from "@/components/store/account/account-shell";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { getReturnRequestsForUser } from "@/lib/account/queries";
import { getAccountUser } from "@/lib/auth";
import { getReturnableOrdersForUser } from "@/lib/orders";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";

export const metadata = { title: "Returns · Account" };

export default async function AccountReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getAccountUser("/account/returns");

  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);
  const [returnable, result] = await Promise.all([
    getReturnableOrdersForUser(user.id),
    getReturnRequestsForUser(user.id, page, PAGE_SIZE.account),
  ]);
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
                const order = Array.isArray(r.orders) ? r.orders[0] : r.orders;
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
