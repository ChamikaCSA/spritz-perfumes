import type { ProductVariant } from "@/types";

export function formatLkr(amount: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMl(ml: number) {
  return `${Number(ml)} ml`;
}

export function variantLabel(type: string, sizeMl: number) {
  if (type === "full_size") return `Full size · ${formatMl(sizeMl)}`;
  return `Decant · ${formatMl(sizeMl)}`;
}

export function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SP-${stamp}-${rand}`;
}

export const LK_DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
] as const;

export const SHIPPING_LKR = 450;

export function lowestPrice(variants: ProductVariant[] = []) {
  if (!variants.length) return 0;
  return Math.min(...variants.map((v) => Number(v.price_lkr)));
}

export function lowestPricedVariant(variants: ProductVariant[] = []) {
  if (!variants.length) return undefined;
  return variants.reduce((best, variant) =>
    Number(variant.price_lkr) < Number(best.price_lkr) ? variant : best,
  );
}

export function saleCompareAt(price: number, compareAt?: number | null) {
  const compare = Number(compareAt);
  if (!Number.isFinite(compare) || compare <= Number(price)) return null;
  return compare;
}
