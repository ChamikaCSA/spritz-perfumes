import { lowestPrice } from "@/lib/commerce";
import { defaultSortOrder } from "@/lib/catalog/sort";
import type {
  Brand,
  Product,
  ProductFilters,
  ProductSort,
  ProductSortOrder,
  StockSummary,
} from "@/types";
import { DEMO_BRANDS, DEMO_PRODUCTS } from "./demo-data";

export { DEMO_BRANDS, DEMO_PRODUCTS };

export function getDemoProductBySlug(slug: string): Product | undefined {
  return DEMO_PRODUCTS.find((p) => p.slug === slug);
}

export function getDemoBrands(): Brand[] {
  return DEMO_BRANDS;
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
        : 72;
  return { sealedBottles: sealed, openMl };
}

function productPrice(product: Product) {
  return lowestPrice(product.variants);
}

export function filterDemo(products: Product[], filters?: ProductFilters) {
  let list = [...products];
  if (filters?.brand) {
    list = list.filter((p) => p.brand?.slug === filters.brand);
  }
  if (filters?.concentration) {
    list = list.filter((p) => p.concentration === filters.concentration);
  }
  if (filters?.type) {
    list = list.filter((p) =>
      p.variants?.some((v) => v.type === filters.type && v.is_active),
    );
  }
  if (filters?.collection) {
    list = list.filter((p) => p.collection === filters.collection);
  }
  if (filters?.gender) {
    list = list.filter((p) => p.gender === filters.gender);
  }
  if (filters?.note) {
    const n = filters.note.toLowerCase();
    list = list.filter((p) =>
      [...p.notes.top, ...p.notes.heart, ...p.notes.base]
        .join(" ")
        .toLowerCase()
        .includes(n),
    );
  }
  if (filters?.size_ml) {
    const size = Number(filters.size_ml);
    list = list.filter((p) =>
      p.variants?.some((v) => Number(v.size_ml) === size),
    );
  }
  if (filters?.min_price) {
    const min = Number(filters.min_price);
    list = list.filter((p) => productPrice(p) >= min);
  }
  if (filters?.max_price) {
    const max = Number(filters.max_price);
    list = list.filter((p) => productPrice(p) <= max);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand?.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q),
    );
  }
  return sortDemo(list, filters?.sort, filters?.order);
}

export function sortDemo(
  list: Product[],
  sort?: ProductSort,
  order?: ProductSortOrder,
) {
  const by = sort ?? "name";
  const dir = order ?? defaultSortOrder(by);
  const next = [...list];
  const mul = dir === "asc" ? 1 : -1;

  switch (by) {
    case "newest":
      return dir === "desc" ? next.reverse() : next;
    case "price":
      return next.sort((a, b) => mul * (productPrice(a) - productPrice(b)));
    case "rating":
      return next.sort(
        (a, b) => mul * ((a.avg_rating ?? 0) - (b.avg_rating ?? 0)),
      );
    case "popularity":
      return next;
    default:
      return next.sort((a, b) => mul * a.name.localeCompare(b.name));
  }
}
