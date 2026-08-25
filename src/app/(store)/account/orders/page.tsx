import Link from "next/link";
import {
  AccountEmpty,
  AccountPageHeader,
  AccountStatus,
} from "@/components/store/account/account-shell";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { getAccountUser } from "@/lib/auth";
import { formatLkr } from "@/lib/commerce";
import { getOrderPageForUser } from "@/lib/orders";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";

export const metadata = { title: "Orders · Account" };

function statusTone(status: string): "amber" | "muted" | "ok" {
  if (status === "delivered") return "ok";
  if (status === "cancelled" || status === "refunded") return "muted";
  return "amber";
}

export default async function AccountOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getAccountUser("/account/orders");

  const { page: pageParam } = await searchParams;
  const result = await getOrderPageForUser(
    user.id,
    parsePage(pageParam),
    PAGE_SIZE.account,
  );

  return (
    <div>
      <AccountPageHeader
        title="Orders"
        description="Track purchases and open any order for details."
      />

      {result.total === 0 ? (
        <AccountEmpty actionHref="/shop" actionLabel="Shop fragrances">
          No orders yet.
        </AccountEmpty>
      ) : (
        <>
          <ul id="results" className="scroll-mt-24 border border-border/60 bg-secondary/20">
            {result.items.map((order) => (
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
          <PaginationNav
            page={result.page}
            pageCount={result.pageCount}
            total={result.total}
            pageSize={result.pageSize}
            pathname="/account/orders"
            compact
          />
        </>
      )}
    </div>
  );
}
