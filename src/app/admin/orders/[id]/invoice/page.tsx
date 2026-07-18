import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/catalog";
import { formatLkr, variantLabel } from "@/lib/utils-commerce";

type Params = Promise<{ id: string }>;

export default async function InvoicePage({ params }: { params: Params }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl bg-white p-10 text-black print:p-0">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Invoice</h1>
          <p className="mt-1 text-sm text-neutral-600">{order.order_number}</p>
        </div>
        <button
          type="button"
          onClick={() => typeof window !== "undefined" && window.print()}
          className="border border-neutral-300 px-3 py-1 text-xs uppercase tracking-wider print:hidden"
        >
          Print
        </button>
      </div>
      <div className="mt-8 grid gap-6 text-sm sm:grid-cols-2">
        <div>
          <p className="font-medium">Bill to</p>
          <p>
            {order.first_name} {order.last_name}
          </p>
          <p>{order.email}</p>
          <p>{order.phone}</p>
        </div>
        <div>
          <p className="font-medium">Ship to</p>
          <p>{order.address_line1}</p>
          {order.address_line2 ? <p>{order.address_line2}</p> : null}
          <p>
            {order.city}, {order.district} {order.postal_code}
          </p>
          <p>{order.country}</p>
        </div>
      </div>
      <table className="mt-10 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-300">
            <th className="py-2">Item</th>
            <th className="py-2">Qty</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {(order.items ?? []).map((item) => (
            <tr key={item.id} className="border-b border-neutral-200">
              <td className="py-2">
                {item.brand_name} {item.product_name} ·{" "}
                {variantLabel(item.variant_type, item.size_ml)}
              </td>
              <td className="py-2">{item.quantity}</td>
              <td className="py-2 text-right">
                {formatLkr(item.line_total_lkr)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6 space-y-1 text-right text-sm">
        <p>Subtotal {formatLkr(order.subtotal_lkr)}</p>
        <p>Shipping {formatLkr(order.shipping_lkr)}</p>
        <p className="text-lg font-semibold">Total {formatLkr(order.total_lkr)}</p>
      </div>
      <PrintScript />
    </div>
  );
}

function PrintScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.querySelector('button')?.addEventListener('click',()=>window.print())`,
      }}
    />
  );
}
