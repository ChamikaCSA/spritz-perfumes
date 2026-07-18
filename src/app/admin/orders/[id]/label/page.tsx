import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/catalog";

type Params = Promise<{ id: string }>;

export default async function ShippingLabelPage({ params }: { params: Params }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-md border-2 border-black bg-white p-8 text-black">
      <p className="text-xs uppercase tracking-[0.2em]">Spritz Perfumes</p>
      <h1 className="mt-4 text-2xl font-semibold">Shipping label</h1>
      <p className="mt-1 text-sm">{order.order_number}</p>
      {order.tracking_number ? (
        <p className="mt-2 text-sm">Tracking: {order.tracking_number}</p>
      ) : null}
      <div className="mt-8 space-y-1 text-sm">
        <p className="font-medium">
          {order.first_name} {order.last_name}
        </p>
        <p>{order.phone}</p>
        <p>{order.address_line1}</p>
        {order.address_line2 ? <p>{order.address_line2}</p> : null}
        <p>
          {order.city}, {order.district} {order.postal_code}
        </p>
        <p>{order.country}</p>
      </div>
      <button
        type="button"
        className="mt-10 border border-black px-4 py-2 text-xs uppercase tracking-wider print:hidden"
      >
        Print
      </button>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.querySelector('button')?.addEventListener('click',()=>window.print())`,
        }}
      />
    </div>
  );
}
