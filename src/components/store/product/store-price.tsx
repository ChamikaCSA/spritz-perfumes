import type { ProductVariant } from "@/types";
import { cn } from "@/lib/utils";
import {
  formatLkr,
  lowestPricedVariant,
  saleCompareAt,
} from "@/lib/commerce";

export function StorePrice({
  price,
  compareAt,
  className,
}: {
  price: number;
  compareAt?: number | null;
  className?: string;
}) {
  const compare = saleCompareAt(price, compareAt);
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5",
        className,
      )}
    >
      {compare != null ? (
        <span className="text-[0.7em] font-sans font-normal text-muted-foreground line-through">
          {formatLkr(compare)}
        </span>
      ) : null}
      <span>{formatLkr(price)}</span>
    </span>
  );
}

export function FromPrice({
  variants,
  className,
}: {
  variants?: ProductVariant[];
  className?: string;
}) {
  const variant = lowestPricedVariant(variants);
  if (!variant) return null;
  return (
    <span className={className}>
      from{" "}
      <StorePrice
        price={Number(variant.price_lkr)}
        compareAt={variant.compare_at_price_lkr}
      />
    </span>
  );
}
