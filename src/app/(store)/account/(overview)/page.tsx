import Link from "next/link";
import {
  AccountEmpty,
  AccountPageHeader,
  AccountPanel,
  AccountStatus,
} from "@/components/store/account/account-shell";
import { countAddressesForUser, getProfile } from "@/lib/account/queries";
import { getSessionUser, isDemoMode } from "@/lib/auth";
import { formatLkr } from "@/lib/commerce";
import { countOrdersForUser, getOrdersForUser } from "@/lib/orders";
import { getReviewPromptsForUser } from "@/lib/reviews";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  if (isDemoMode()) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-display text-5xl">Account</h1>
        <p className="mt-4 text-muted-foreground">
          Connect Supabase to enable customer accounts.
        </p>
      </div>
    );
  }

  const user = await getSessionUser();
  if (!user) return null;

  const [profile, orderCount, recentOrders, reviewPrompts, addressCount] =
    await Promise.all([
      getProfile(user.id),
      countOrdersForUser(user.id),
      getOrdersForUser(user.id, { limit: 4, includeItems: false }),
      getReviewPromptsForUser(user.id),
      countAddressesForUser(user.id),
    ]);

  const awaitingReview = reviewPrompts.filter((p) => !p.existingReview);

  return (
    <div className="space-y-5 sm:space-y-8">
      <AccountPageHeader
        title="Overview"
        description="Orders, reviews, and your details in one place."
      />

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Link
          href="/account/orders"
          className="border border-border/60 bg-secondary/20 p-3 transition hover:border-amber/40 sm:p-5"
        >
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px] sm:tracking-[0.18em]">
            Orders
          </p>
          <p className="mt-2 font-display text-2xl tabular-nums sm:mt-3 sm:text-4xl">
            {orderCount}
          </p>
        </Link>
        <Link
          href="/account/reviews"
          className="border border-border/60 bg-secondary/20 p-3 transition hover:border-amber/40 sm:p-5"
        >
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px] sm:tracking-[0.18em]">
            Reviews
          </p>
          <p className="mt-2 font-display text-2xl tabular-nums text-amber sm:mt-3 sm:text-4xl">
            {awaitingReview.length}
          </p>
        </Link>
        <Link
          href="/account/profile"
          className="border border-border/60 bg-secondary/20 p-3 transition hover:border-amber/40 sm:p-5"
        >
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px] sm:tracking-[0.18em]">
            Addresses
          </p>
          <p className="mt-2 font-display text-2xl tabular-nums sm:mt-3 sm:text-4xl">
            {addressCount}
          </p>
        </Link>
      </div>

      <AccountPanel
        title="Profile"
        action={
          <Link
            href="/account/profile"
            className="inline-flex min-h-11 items-center text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-amber"
          >
            Manage
          </Link>
        }
      >
        <dl className="grid gap-4 sm:grid-cols-3 text-sm">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Name
            </dt>
            <dd className="mt-1">{profile?.full_name || "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Phone
            </dt>
            <dd className="mt-1">{profile?.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Email
            </dt>
            <dd className="mt-1 truncate">{user.email}</dd>
          </div>
        </dl>
      </AccountPanel>

      {awaitingReview.length > 0 ? (
        <AccountPanel
          title="Leave a review"
          description="Share how a fragrance wears after your order."
          action={
            <Link
              href="/account/reviews"
              className="inline-flex min-h-11 items-center text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-amber"
            >
              View all
            </Link>
          }
        >
          <ul className="divide-y divide-border/50">
            {awaitingReview.slice(0, 3).map(({ product }) => (
              <li key={product.id}>
                <Link
                  href="/account/reviews"
                  className="flex min-h-12 items-center justify-between gap-3 py-3 transition first:pt-0 last:pb-0 hover:text-amber sm:min-h-14 sm:gap-4 sm:py-4"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {product.brand?.name}
                    </p>
                    <p className="truncate font-medium">{product.name}</p>
                  </div>
                  <span className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-amber">
                    Write
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </AccountPanel>
      ) : null}

      <AccountPanel
        title="Recent orders"
        action={
          orderCount > 0 ? (
            <Link
              href="/account/orders"
              className="inline-flex min-h-11 items-center text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-amber"
            >
              All orders
            </Link>
          ) : null
        }
      >
        {recentOrders.length === 0 ? (
          <AccountEmpty actionHref="/shop" actionLabel="Browse the shop">
            No orders yet.
          </AccountEmpty>
        ) : (
          <ul className="divide-y divide-border/50">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex min-h-12 items-center justify-between gap-3 py-3 transition first:pt-0 last:pb-0 hover:text-amber sm:min-h-14 sm:gap-4 sm:py-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{order.order_number}</p>
                    <AccountStatus>
                      {order.status.replaceAll("_", " ")}
                    </AccountStatus>
                  </div>
                  <p className="shrink-0 tabular-nums">
                    {formatLkr(Number(order.total_lkr))}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AccountPanel>
    </div>
  );
}
