import Link from "next/link";
import { OrderFulfillmentPanel } from "@/components/admin/orders/order-fulfillment-panel";
import {
  AdminPageHeader,
  AdminPanel,
  adminRowActionClass,
  adminTextLinkClass,
} from "@/components/admin/layout/admin-shell";
import { formatLkr, variantLabel } from "@/lib/commerce";
import { getAdminOrderDetail } from "@/lib/orders";
import { notFound } from "next/navigation";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const order = await getAdminOrderDetail(id);
  return {
    title: order ? `${order.order_number} · Admin` : "Order · Admin",
  };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const order = await getAdminOrderDetail(id);
  if (!order) notFound();

  const payment = order.payments[0];
  const items = order.items ?? [];

  return (
    <div className="space-y-5 sm:space-y-8">
      <AdminPageHeader
        title={order.order_number}
        description={`${order.first_name} ${order.last_name} · ${formatLkr(Number(order.total_lkr))} · ${new Date(order.created_at).toLocaleString()}`}
      />

      <AdminPanel title="Fulfillment">
        <OrderFulfillmentPanel
          orderId={order.id}
          orderNumber={order.order_number}
          status={order.status}
          trackingNumber={order.tracking_number ?? null}
        />
      </AdminPanel>

      <AdminPanel title="User">
        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            {order.first_name} {order.last_name}
          </p>
          <p>
            {order.email} · {order.phone}
          </p>
          <p>
            {order.address_line1}
            {order.address_line2 ? `, ${order.address_line2}` : ""}
          </p>
          <p>
            {order.city}, {order.district}
            {order.postal_code ? ` ${order.postal_code}` : ""}, {order.country}
          </p>
          {order.user_id ? (
            <Link
              href={`/admin/users/${order.user_id}`}
              className={adminTextLinkClass}
            >
              User profile
            </Link>
          ) : null}
        </div>
      </AdminPanel>

      {payment ? (
        <AdminPanel title="Payment">
          <p className="text-sm text-muted-foreground">
            PayHere {payment.status}
            {payment.method ? ` · ${payment.method}` : ""}
            {payment.payhere_payment_id
              ? ` · ${payment.payhere_payment_id}`
              : ""}
          </p>
        </AdminPanel>
      ) : null}

      <AdminPanel title="Items">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap justify-between gap-2 border border-border/30 px-3 py-2"
            >
              <span className="min-w-0 flex-1">
                {item.brand_name} {item.product_name} ·{" "}
                {variantLabel(item.variant_type, Number(item.size_ml))} ×{" "}
                {item.quantity}
              </span>
              <span className="shrink-0 tabular-nums text-foreground">
                {formatLkr(Number(item.line_total_lkr))}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-border/40 pt-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">
              {formatLkr(Number(order.subtotal_lkr))}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span className="tabular-nums">
              {formatLkr(Number(order.shipping_lkr))}
            </span>
          </div>
          <div className="flex justify-between font-medium text-foreground">
            <span>Total</span>
            <span className="tabular-nums text-amber">
              {formatLkr(Number(order.total_lkr))}
            </span>
          </div>
        </div>
      </AdminPanel>

      <AdminPanel title="Documents">
        <div className="flex flex-wrap gap-2">
          <a
            href={`/admin/orders/${order.id}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            className={adminRowActionClass}
          >
            Invoice
          </a>
          <a
            href={`/admin/orders/${order.id}/label`}
            target="_blank"
            rel="noopener noreferrer"
            className={adminRowActionClass}
          >
            Shipping label
          </a>
        </div>
      </AdminPanel>
    </div>
  );
}
