import { DEMO_PRODUCTS } from "./demo-data";
import type { Brand, Product, ProductVariant, StockSummary } from "./types";
import { isSupabaseConfigured } from "./supabase/env";

export { isSupabaseConfigured };

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

export function getDemoProductBySlug(slug: string): Product | undefined {
  return DEMO_PRODUCTS.find((p) => p.slug === slug);
}

export function getDemoBrands(): Brand[] {
  const map = new Map<string, Brand>();
  for (const p of DEMO_PRODUCTS) {
    if (p.brand) map.set(p.brand.id, p.brand);
  }
  return Array.from(map.values());
}

export function demoStockForProduct(productId: string): StockSummary {
  const sealed = DEMO_PRODUCTS.find((p) => p.id === productId)
    ? productId.endsWith("3")
      ? 1
      : 2
    : 0;
  const openMl = productId.endsWith("3")
    ? 55
    : productId.endsWith("4")
      ? 30
      : productId.endsWith("5")
        ? 40
        : 70;
  return { sealedBottles: sealed, openMl };
}
