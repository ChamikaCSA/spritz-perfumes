import { lowestPrice } from "@/lib/commerce";
import { liveOrDemo } from "@/lib/data";
import { getStockSummary } from "@/lib/inventory/stock";
import {
  PAGE_SIZE,
  PRODUCT_FETCH_CAP,
  emptyPage,
  pageFromTotal,
  pageRange,
  paginate,
  parsePage,
  type PageResult,
} from "@/lib/pagination";
import { createServiceClient } from "@/lib/supabase/admin";
import type {
  Concentration,
  Product,
  ProductFilters,
  ProductSort,
  VariantType,
} from "@/types";
import { DEMO_PRODUCTS, filterDemo } from "./demo";
import { mapProductRows, type ProductRow } from "./normalize";
import { defaultSortOrder } from "./sort";

export type ProductQuery = ProductFilters & {
  page?: number | string;
  pageSize?: number;
  limit?: number;
};

function productPrice(product: Product) {
  return lowestPrice(product.variants);
}

function toPrefixSearchQuery(raw: string): string | null {
  const terms = raw
    .trim()
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter((t) => t.length > 0);
  if (!terms.length) return null;
  return terms.map((t) => `${t}:*`).join(" & ");
}

function needsInMemoryProductWork(filters?: ProductQuery) {
  const sortBy = filters?.sort ?? "name";
  return Boolean(
    filters?.note ||
      filters?.min_price ||
      filters?.max_price ||
      filters?.available === "1" ||
      sortBy === "price" ||
      sortBy === "rating" ||
      sortBy === "popularity",
  );
}

function pagingFromQuery(filters?: ProductQuery) {
  if (filters?.limit && filters.page == null && filters.pageSize == null) {
    return { page: 1, pageSize: Math.max(1, filters.limit), mode: "limit" as const };
  }
  if (filters?.page != null || filters?.pageSize != null) {
    return {
      page: parsePage(filters?.page),
      pageSize: filters?.pageSize ?? PAGE_SIZE.shop,
      mode: "page" as const,
    };
  }
  return null;
}

async function applyInMemoryProductFilters(
  products: Product[],
  filters?: ProductQuery,
) {
  let list = products;
  if (filters?.note) {
    const n = filters.note.toLowerCase();
    list = list.filter((p) =>
      [...p.notes.top, ...p.notes.heart, ...p.notes.base]
        .join(" ")
        .toLowerCase()
        .includes(n),
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

  if (filters?.available === "1") {
    const withStock = await Promise.all(
      list.map(async (p) => {
        const stock = await getStockSummary(p.id);
        const ok = (p.variants ?? []).some((v) =>
          v.type === "full_size"
            ? stock.sealedBottles >= 1
            : stock.openMl >= Number(v.size_ml),
        );
        return ok ? p : null;
      }),
    );
    list = withStock.filter(Boolean) as Product[];
  }

  const sortBy = filters?.sort ?? "name";
  const sortOrder = filters?.order ?? defaultSortOrder(sortBy);
  const mul = sortOrder === "asc" ? 1 : -1;
  if (sortBy === "price") {
    list.sort((a, b) => mul * (productPrice(a) - productPrice(b)));
  } else if (sortBy === "rating") {
    list.sort((a, b) => mul * ((a.avg_rating ?? 0) - (b.avg_rating ?? 0)));
  } else if (sortBy === "popularity") {
    const sales = await getSalesVolumeMap();
    list.sort(
      (a, b) => mul * ((sales.get(a.id) ?? 0) - (sales.get(b.id) ?? 0)),
    );
  }

  return list;
}

async function getSalesVolumeMap(): Promise<Map<string, number>> {
  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from("product_sales_summary")
      .select("product_id, units_sold");
    if (error || !data) {
      if (error) console.error("getSalesVolumeMap failed", error.message);
      return new Map();
    }
    return new Map(
      data.map((row) => [
        row.product_id as string,
        Number(row.units_sold),
      ]),
    );
  } catch (err) {
    console.error("getSalesVolumeMap failed", err);
    return new Map();
  }
}

export async function getProducts(filters?: ProductQuery): Promise<Product[]> {
  const page = await getProductPage(filters);
  return page.items;
}

export async function getProductPage(
  filters?: ProductQuery,
): Promise<PageResult<Product>> {
  const paging = pagingFromQuery(filters) ?? {
    page: 1,
    pageSize: PRODUCT_FETCH_CAP,
    mode: "all" as const,
  };

  return liveOrDemo(
    () => {
      const list = filterDemo(DEMO_PRODUCTS, filters);
      if (paging.mode === "all") {
        return pageFromTotal(list, list.length, 1, Math.max(list.length, 1));
      }
      return paginate(list, paging.page, paging.pageSize);
    },
    async (supabase) => {
      const brandJoin = filters?.brand ? "brands!inner(*)" : "brands(*)";
      const inMemory = needsInMemoryProductWork(filters);

      let query = supabase
        .from("products")
        .select(
          `*, ${brandJoin}, product_variants!inner(*), product_rating_summary(avg_rating, review_count)`,
          { count: "exact" },
        )
        .eq("is_active", true)
        .eq("product_variants.is_active", true);

      if (filters?.concentration) {
        query = query.eq(
          "concentration",
          filters.concentration as Concentration,
        );
      }
      if (filters?.brand) {
        query = query.eq("brands.slug", filters.brand);
      }
      if (filters?.type) {
        query = query.eq(
          "product_variants.type",
          filters.type as VariantType,
        );
      }
      if (filters?.collection) {
        query = query.eq("collection", filters.collection);
      }
      if (filters?.gender) {
        query = query.eq("gender", filters.gender);
      }
      if (filters?.size_ml) {
        query = query.eq("product_variants.size_ml", Number(filters.size_ml));
      }
      if (filters?.q) {
        const tsQuery = toPrefixSearchQuery(filters.q);
        if (tsQuery) {
          query = query.textSearch("search_vector", tsQuery, {
            config: "english",
          });
        }
      }

      const sortBy: ProductSort = filters?.sort ?? "name";
      const sortOrder = filters?.order ?? defaultSortOrder(sortBy);
      if (sortBy === "newest") {
        query = query.order("created_at", { ascending: sortOrder === "asc" });
      } else if (sortBy === "name") {
        query = query.order("name", { ascending: sortOrder === "asc" });
      } else {
        query = query.order("name");
      }

      if (!inMemory && paging.mode !== "all") {
        const { from, to } = pageRange(paging.page, paging.pageSize);
        query = query.range(from, to);
      } else if (inMemory || paging.mode === "all") {
        query = query.limit(PRODUCT_FETCH_CAP);
      }

      const { data, error, count } = await query;
      if (error) {
        console.error("getProducts failed", error.message);
        return emptyPage<Product>(paging.page, paging.pageSize);
      }

      let products = mapProductRows(
        (data ?? []) as unknown as ProductRow[],
        filters,
      );

      if (inMemory) {
        products = await applyInMemoryProductFilters(products, filters);
        if (paging.mode === "all") {
          return pageFromTotal(
            products,
            products.length,
            1,
            Math.max(products.length, 1),
          );
        }
        return paginate(products, paging.page, paging.pageSize);
      }

      const total = count ?? products.length;
      if (paging.mode === "all") {
        return pageFromTotal(products, total, 1, Math.max(total, 1));
      }
      return pageFromTotal(products, total, paging.page, paging.pageSize);
    },
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return liveOrDemo(
    () => DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null,
    async (supabase) => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "*, brands(*), product_variants(*), product_rating_summary(avg_rating, review_count)",
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("getProductBySlug failed", error.message);
        return null;
      }
      if (!data) return null;

      const row = data as unknown as ProductRow;
      const product = mapProductRows([row])[0];
      const stock = await getStockSummary(product.id);
      product.variants = (product.variants ?? []).map((v) => ({
        ...v,
        purchasable:
          v.type === "full_size"
            ? stock.sealedBottles >= 1
            : stock.openMl >= Number(v.size_ml),
      }));
      return product;
    },
  );
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const unique = [...new Set(ids.filter(Boolean))].slice(0, 100);
  if (!unique.length) return [];

  return liveOrDemo(
    () => {
      const map = new Map(DEMO_PRODUCTS.map((p) => [p.id, p]));
      return unique.map((id) => map.get(id)).filter(Boolean) as Product[];
    },
    async (supabase) => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "*, brands(*), product_variants(*), product_rating_summary(avg_rating, review_count)",
        )
        .in("id", unique)
        .eq("is_active", true);
      if (error) {
        console.error("getProductsByIds failed", error.message);
        return [];
      }
      const mapped = mapProductRows((data ?? []) as unknown as ProductRow[]);
      const byId = new Map(mapped.map((p) => [p.id, p]));
      return unique.map((id) => byId.get(id)).filter(Boolean) as Product[];
    },
  );
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  return liveOrDemo(
    () =>
      DEMO_PRODUCTS.filter(
        (p) => p.id !== product.id && p.brand_id === product.brand_id,
      ).slice(0, limit),
    async (supabase) => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "*, brands(*), product_variants(*), product_rating_summary(avg_rating, review_count)",
        )
        .eq("is_active", true)
        .eq("brand_id", product.brand_id)
        .neq("id", product.id)
        .order("name")
        .limit(limit);
      if (error) {
        console.error("getRelatedProducts failed", error.message);
        return [];
      }
      return mapProductRows((data ?? []) as unknown as ProductRow[]);
    },
  );
}

export async function getBestSellers(limit = 4): Promise<Product[]> {
  return liveOrDemo(
    () => DEMO_PRODUCTS.slice(0, limit),
    async () => {
      const sales = await getSalesVolumeMap();
      const topIds = [...sales.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => id);

      if (topIds.length >= limit) {
        return getProductsByIds(topIds);
      }

      const sold = await getProductsByIds(topIds);
      const soldIds = new Set(sold.map((p) => p.id));
      const fallback = await getProducts({
        sort: "newest",
        limit: limit + soldIds.size,
      });
      return [...sold, ...fallback.filter((p) => !soldIds.has(p.id))].slice(
        0,
        limit,
      );
    },
  );
}

export async function getLimitedStock(limit = 4): Promise<Product[]> {
  return liveOrDemo(
    () => DEMO_PRODUCTS.slice(0, limit),
    async (supabase) => {
      const { data: lots, error } = await supabase
        .from("inventory_lots")
        .select("product_id, status, remaining_ml")
        .in("status", ["sealed", "open"])
        .limit(400);
      if (error || !lots?.length) {
        if (error) console.error("getLimitedStock failed", error.message);
        return [];
      }

      const scores = new Map<string, number>();
      for (const lot of lots) {
        const add =
          lot.status === "sealed" ? 100 : Number(lot.remaining_ml) || 0;
        scores.set(lot.product_id, (scores.get(lot.product_id) ?? 0) + add);
      }

      const limitedIds = [...scores.entries()]
        .filter(([, score]) => score > 0 && score < 150)
        .sort((a, b) => a[1] - b[1])
        .slice(0, limit)
        .map(([id]) => id);

      return getProductsByIds(limitedIds);
    },
  );
}
