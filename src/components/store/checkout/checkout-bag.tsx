import { formatLkr, SHIPPING_LKR, variantLabel } from "@/lib/commerce";

export function CheckoutBag({
  items,
  total,
}: {
  items: {
    variantId: string;
    productName: string;
    variantType: string;
    sizeMl: number;
    quantity: number;
    unitPriceLkr: number;
  }[];
  total: number;
}) {
  return (
    <aside className="border border-border p-5">
      <h2 className="font-display text-2xl">Bag</h2>
      <ul className="mt-4 space-y-3 text-sm">
        {items.map((item) => (
          <li key={item.variantId} className="flex justify-between gap-3">
            <span className="min-w-0 flex-1 truncate">
              {item.productName} · {variantLabel(item.variantType, item.sizeMl)}{" "}
              × {item.quantity}
            </span>
            <span className="shrink-0 tabular-nums">
              {formatLkr(item.unitPriceLkr * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{formatLkr(SHIPPING_LKR)}</span>
        </div>
        <div className="flex justify-between font-medium text-amber">
          <span>Total</span>
          <span>{formatLkr(total)}</span>
        </div>
      </div>
    </aside>
  );
}
