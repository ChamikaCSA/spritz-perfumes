import type { Brand, Product } from "@/types";

export type ProductRow = Product & {
  brands?: Brand | Brand[] | null;
  product_variants?: Product["variants"];
  product_rating_summary?:
    | { avg_rating: number; review_count: number }
    | { avg_rating: number; review_count: number }[]
    | null;
};

export function normalizeProduct(row: ProductRow): Product {
  const brand = Array.isArray(row.brands) ? row.brands[0] : row.brands;
  const rating = Array.isArray(row.product_rating_summary)
    ? row.product_rating_summary[0]
    : row.product_rating_summary;
  return {
    ...row,
    brand: brand ?? row.brand ?? undefined,
    notes: row.notes ?? { top: [], heart: [], base: [] },
    images: row.images ?? [],
    perfumers: row.perfumers ?? [],
    collection: row.collection ?? "core",
    variants: row.product_variants ?? row.variants ?? [],
    avg_rating: rating ? Number(rating.avg_rating) : row.avg_rating ?? null,
    review_count: rating ? Number(rating.review_count) : row.review_count ?? 0,
  };
}

export function mapProductRows(
  data: ProductRow[],
  filters?: { type?: string },
): Product[] {
  return data.map((row) =>
    normalizeProduct({
      ...(row as Product),
      brands: row.brands,
      product_variants: (row.product_variants ?? []).filter(
        (v) => v.is_active && (!filters?.type || v.type === filters.type),
      ),
      product_rating_summary: row.product_rating_summary,
    }),
  );
}
