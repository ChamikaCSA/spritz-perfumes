import Link from "next/link";
import { getOrderById } from "@/lib/catalog";
import { formatLkr, isSupabaseConfigured, variantLabel } from "@/lib/utils-commerce";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Order" };

export default async function OrderPage({ params }: { params: Params }) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:py-40">
        <p className="text-xs uppercase tracking-[0.3em] text-amber">Thank you</p>
        <h1 className="mt-3 font-display text-3xl sm:text-5xl">Order received</h1>
        <p className="mt-4 text-muted-foreground">
          Demo mode — connect Supabase and PayHere to persist orders and take
          live payments. Reference:{" "}
          <span className="text-foreground">{id.slice(0, 8)}</span>
        </p>
        <Link
          href="/shop"
          className="mt-10 inline-flex h-11 items-center bg-amber px-6 text-xs uppercase tracking-[0.2em] text-primary-foreground"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const order = await getOrderById(id);

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:py-40">
        <h1 className="font-display text-3xl sm:text-4xl">Order not found</h1>
        <Link href="/shop" className="mt-6 inline-block text-amber">
          Back to shop
        </Link>
      </div>
    );
  }

  const canPromptReview = ["paid", "packing", "shipped", "delivered"].includes(
    order.status,
  );

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28">
      <p className="text-xs uppercase tracking-[0.3em] text-amber">
        {order.status.replace("_", " ")}
      </p>
      <h1 className="mt-2 font-display text-3xl sm:mt-3 sm:text-5xl">
        Order {order.order_number}
      </h1>
      <p className="mt-3 text-muted-foreground">
        We&apos;ll email {order.email} with updates. Payment confirmation may
        take a moment if you just paid via PayHere.
      </p>

      <ul className="mt-6 space-y-4 border border-border p-5 sm:mt-10">
        {order.items?.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 text-sm">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {item.brand_name} {item.product_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {variantLabel(item.variant_type, Number(item.size_ml))} ×{" "}
                {item.quantity}
              </p>
            </div>
            <p className="shrink-0 tabular-nums">
              {formatLkr(Number(item.line_total_lkr))}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between text-sm">
        <span className="text-muted-foreground">Total</span>
        <span className="font-medium">{formatLkr(Number(order.total_lkr))}</span>
      </div>

      <div className="mt-8 text-sm text-muted-foreground">
        <p>
          Ship to {order.first_name} {order.last_name}
        </p>
        <p>
          {order.address_line1}
          {order.address_line2 ? `, ${order.address_line2}` : ""}
        </p>
        <p>
          {order.city}, {order.district}
        </p>
      </div>

      {canPromptReview ? (
        <div className="mt-10 border border-amber/30 bg-amber/5 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-amber">
            How did it wear?
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Leave a review for items from this order in your account.
          </p>
          <Link
            href="/account/reviews"
            className="mt-4 inline-flex h-10 items-center bg-amber px-5 text-xs uppercase tracking-[0.16em] text-primary-foreground"
          >
            Review purchases
          </Link>
        </div>
      ) : null}
    </div>
  );
}
