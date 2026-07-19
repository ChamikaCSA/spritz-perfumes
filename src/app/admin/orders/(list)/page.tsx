import Link from "next/link";
import { updateOrderStatus } from "@/actions/admin";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import {
  AdminField,
  AdminFieldGrid,
  AdminForm,
  AdminFormSection,
  adminFieldClass,
} from "@/components/admin/admin-form";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  adminButtonClass,
} from "@/components/admin/admin-shell";
import { AdminStatus, orderStatusTone } from "@/components/admin/admin-status";
import { createClient } from "@/lib/supabase/server";
import {
  formatLkr,
  isSupabaseConfigured,
  variantLabel,
} from "@/lib/utils-commerce";

export const metadata = { title: "Orders · Admin" };

const statuses = [
  "pending_payment",
  "paid",
  "packing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
] as const;

type Payment = {
  payhere_payment_id: string | null;
  status: string;
  method: string | null;
};

type OrderItem = {
  id: string;
  product_name: string;
  brand_name: string;
  variant_type: string;
  size_ml: number;
  quantity: number;
  line_total_lkr: number;
};

type OrderRow = {
  id: string;
  order_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line1: string;
  city: string;
  district: string;
  user_id: string | null;
  status: string;
  total_lkr: number;
  tracking_number: string | null;
  created_at: string;
};

function OrderEditDialog({
  order,
  payment,
  items,
}: {
  order: OrderRow;
  payment?: Payment;
  items: OrderItem[];
}) {
  return (
    <AdminFormDialog
      triggerLabel="Edit"
      title={order.order_number}
      description={`${order.first_name} ${order.last_name} · ${formatLkr(Number(order.total_lkr))}`}
      size="lg"
      triggerVariant="link"
      className="min-h-9 px-1.5 text-[11px]"
    >
      <div className="space-y-6">
        <AdminFormSection title="Customer">
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              {order.email} · {order.phone}
            </p>
            <p>
              {order.address_line1}, {order.city}, {order.district}
            </p>
            {order.user_id ? (
              <Link
                href={`/admin/customers/${order.user_id}`}
                className="inline-flex min-h-11 items-center text-xs uppercase tracking-[0.14em] text-amber"
              >
                Customer profile
              </Link>
            ) : null}
            {payment ? (
              <p className="text-xs text-amber">
                PayHere {payment.status}
                {payment.payhere_payment_id
                  ? ` · ${payment.payhere_payment_id}`
                  : ""}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3 pt-1 text-xs uppercase tracking-[0.14em]">
              <Link
                href={`/admin/orders/${order.id}/invoice`}
                className="inline-flex min-h-11 items-center text-muted-foreground hover:text-amber"
              >
                Invoice
              </Link>
              <Link
                href={`/admin/orders/${order.id}/label`}
                className="inline-flex min-h-11 items-center text-muted-foreground hover:text-amber"
              >
                Shipping label
              </Link>
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection title="Items">
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
        </AdminFormSection>

        <AdminForm action={updateOrderStatus} bare>
          <AdminFormSection title="Fulfillment">
            <input type="hidden" name="id" value={order.id} />
            <AdminFieldGrid>
              <AdminField label="Status">
                <select
                  name="status"
                  defaultValue={order.status}
                  className={adminFieldClass}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </AdminField>
              <AdminField label="Tracking number">
                <input
                  name="tracking_number"
                  defaultValue={order.tracking_number ?? ""}
                  placeholder="Optional"
                  className={adminFieldClass}
                />
              </AdminField>
            </AdminFieldGrid>
          </AdminFormSection>
          <button type="submit" className={adminButtonClass}>
            Update order
          </button>
        </AdminForm>
      </div>
    </AdminFormDialog>
  );
}

export default async function AdminOrdersPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div>
        <AdminPageHeader
          title="Orders"
          description="Connect Supabase and PayHere to manage live orders."
        />
      </div>
    );
  }

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*), payments(payhere_payment_id, status, method)")
    .order("created_at", { ascending: false });

  const rows = (orders ?? []).map((order) => {
    const payments = (order.payments ?? []) as Payment[];
    const items = (order.order_items ?? []) as OrderItem[];
    return {
      order: order as unknown as OrderRow,
      payment: payments[0],
      items,
    };
  });

  return (
    <div className="space-y-5 sm:space-y-8">
      <AdminPageHeader
        title="Orders"
        description="Fulfillment, tracking, invoices, and shipping labels."
      />

      <AdminPanel>
        {rows.length ? (
          <>
            <ul className="divide-y divide-border/50 md:hidden">
              {rows.map(({ order, payment, items }) => (
                <li
                  key={order.id}
                  className="flex items-center gap-2 px-0 py-2 sm:gap-3 sm:py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium tabular-nums">
                      {order.order_number}
                      <span className="mx-1.5 font-normal text-border">·</span>
                      <span className="font-normal text-muted-foreground">
                        {order.first_name} {order.last_name}
                      </span>
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                      <AdminStatus tone={orderStatusTone(order.status)}>
                        {order.status.replaceAll("_", " ")}
                      </AdminStatus>
                      <span className="tabular-nums">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <p className="tabular-nums text-sm text-amber">
                      {formatLkr(Number(order.total_lkr))}
                    </p>
                    <OrderEditDialog
                      order={order}
                      payment={payment}
                      items={items}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border/60 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5 font-normal">Order</th>
                    <th className="px-3 py-2.5 font-normal">Customer</th>
                    <th className="px-3 py-2.5 font-normal">Status</th>
                    <th className="px-3 py-2.5 font-normal text-right">Total</th>
                    <th className="px-3 py-2.5 font-normal text-right">Date</th>
                    <th className="px-3 py-2.5 font-normal" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {rows.map(({ order, payment, items }) => (
                    <tr key={order.id} className="hover:bg-secondary/20">
                      <td className="px-3 py-2 font-medium tabular-nums">
                        {order.order_number}
                      </td>
                      <td className="max-w-48 truncate px-3 py-2 text-muted-foreground">
                        {order.first_name} {order.last_name}
                      </td>
                      <td className="px-3 py-2">
                        <AdminStatus tone={orderStatusTone(order.status)}>
                          {order.status.replaceAll("_", " ")}
                        </AdminStatus>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-amber">
                        {formatLkr(Number(order.total_lkr))}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <OrderEditDialog
                          order={order}
                          payment={payment}
                          items={items}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <AdminEmpty>No orders yet</AdminEmpty>
        )}
      </AdminPanel>
    </div>
  );
}
