import { DEMO_BRANDS, DEMO_PRODUCTS } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";
import type {
  Brand,
  Order,
  Product,
  ProductFilters,
  ProductSort,
  ProductSortOrder,
  Review,
  StockSummary,
} from "@/lib/types";
import { defaultSortOrder } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type ProductRow = Product & {
  brands?: Brand | Brand[] | null;
  product_variants?: Product["variants"];
  product_rating_summary?:
    | { avg_rating: number; review_count: number }
    | { avg_rating: number; review_count: number }[]
    | null;
};

function normalizeProduct(row: ProductRow): Product {
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

function lowestPrice(product: Product) {
  const prices = (product.variants ?? []).map((v) => Number(v.price_lkr));
  return prices.length ? Math.min(...prices) : 0;
}

function filterDemo(products: Product[], filters?: ProductFilters) {
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
    list = list.filter((p) => lowestPrice(p) >= min);
  }
  if (filters?.max_price) {
    const max = Number(filters.max_price);
    list = list.filter((p) => lowestPrice(p) <= max);
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

function sortDemo(
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
      return next.sort((a, b) => mul * (lowestPrice(a) - lowestPrice(b)));
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

export async function getProducts(
  filters?: ProductFilters,
): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return filterDemo(DEMO_PRODUCTS, filters);
  }

  const supabase = await createClient();
  const brandJoin = filters?.brand ? "brands!inner(*)" : "brands(*)";

  let query = supabase
    .from("products")
    .select(
      `*, ${brandJoin}, product_variants!inner(*), product_rating_summary(avg_rating, review_count)`,
    )
    .eq("is_active", true)
    .eq("product_variants.is_active", true);

  if (filters?.concentration) {
    query = query.eq("concentration", filters.concentration);
  }
  if (filters?.brand) {
    query = query.eq("brands.slug", filters.brand);
  }
  if (filters?.type) {
    query = query.eq("product_variants.type", filters.type);
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
    query = query.textSearch("search_vector", filters.q, {
      type: "websearch",
      config: "english",
    });
  }

  const sortBy = filters?.sort ?? "name";
  const sortOrder = filters?.order ?? defaultSortOrder(sortBy);
  if (sortBy === "newest") {
    query = query.order("created_at", { ascending: sortOrder === "asc" });
  } else if (sortBy === "name") {
    query = query.order("name", { ascending: sortOrder === "asc" });
  } else {
    query = query.order("name");
  }

  const { data, error } = await query;
  if (error) {
    console.error("getProducts failed", error.message);
    return [];
  }
  if (!data) return [];

  let products = data.map((row) =>
    normalizeProduct({
      ...(row as Product),
      brands: (row as ProductRow).brands,
      product_variants: ((row as ProductRow).product_variants ?? []).filter(
        (v) => v.is_active && (!filters?.type || v.type === filters.type),
      ),
      product_rating_summary: (row as ProductRow).product_rating_summary,
    }),
  );

  if (filters?.note) {
    const n = filters.note.toLowerCase();
    products = products.filter((p) =>
      [...p.notes.top, ...p.notes.heart, ...p.notes.base]
        .join(" ")
        .toLowerCase()
        .includes(n),
    );
  }
  if (filters?.min_price) {
    const min = Number(filters.min_price);
    products = products.filter((p) => lowestPrice(p) >= min);
  }
  if (filters?.max_price) {
    const max = Number(filters.max_price);
    products = products.filter((p) => lowestPrice(p) <= max);
  }

  if (filters?.available === "1") {
    const withStock = await Promise.all(
      products.map(async (p) => {
        const stock = await getStockSummary(p.id);
        const ok = (p.variants ?? []).some((v) =>
          v.type === "full_size"
            ? stock.sealedBottles >= 1
            : stock.openMl >= Number(v.size_ml),
        );
        return ok ? p : null;
      }),
    );
    products = withStock.filter(Boolean) as Product[];
  }

  const mul = sortOrder === "asc" ? 1 : -1;
  if (sortBy === "price") {
    products.sort((a, b) => mul * (lowestPrice(a) - lowestPrice(b)));
  } else if (sortBy === "rating") {
    products.sort(
      (a, b) => mul * ((a.avg_rating ?? 0) - (b.avg_rating ?? 0)),
    );
  } else if (sortBy === "popularity") {
    const sales = await getSalesVolumeMap();
    products.sort(
      (a, b) => mul * ((sales.get(a.id) ?? 0) - (sales.get(b.id) ?? 0)),
    );
  }

  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }

  const supabase = await createClient();
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

  const product = normalizeProduct({
    ...(data as Product),
    brands: (data as ProductRow).brands,
    product_variants: ((data as ProductRow).product_variants ?? []).filter(
      (v) => v.is_active,
    ),
    product_rating_summary: (data as ProductRow).product_rating_summary,
  });

  const stock = await getStockSummary(product.id);
  product.variants = (product.variants ?? []).map((v) => ({
    ...v,
    purchasable:
      v.type === "full_size"
        ? stock.sealedBottles >= 1
        : stock.openMl >= Number(v.size_ml),
  }));

  return product;
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  if (!isSupabaseConfigured()) {
    return DEMO_BRANDS.find((b) => b.slug === slug) ?? null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as Brand;
}

export async function getBrands(): Promise<Brand[]> {
  if (!isSupabaseConfigured()) return DEMO_BRANDS;

  const supabase = await createClient();
  const { data, error } = await supabase.from("brands").select("*").order("name");
  if (error) {
    console.error("getBrands failed", error.message);
    return [];
  }
  return (data as Brand[]) ?? [];
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const all = await getProducts({ brand: product.brand?.slug });
  return all.filter((p) => p.id !== product.id).slice(0, limit);
}

export async function getBestSellers(limit = 4): Promise<Product[]> {
  if (!isSupabaseConfigured()) return DEMO_PRODUCTS.slice(0, limit);

  const [products, sales] = await Promise.all([
    getProducts(),
    getSalesVolumeMap(),
  ]);
  return [...products]
    .sort((a, b) => (sales.get(b.id) ?? 0) - (sales.get(a.id) ?? 0))
    .slice(0, limit);
}

/** Units sold from completed (paid+) orders — used for Popular sort / best sellers. */
async function getSalesVolumeMap(): Promise<Map<string, number>> {
  if (!isSupabaseConfigured()) return new Map();
  try {
    const { createServiceClient } = await import("@/lib/supabase/admin");
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
        (row as { product_id: string }).product_id,
        Number((row as { units_sold: number }).units_sold),
      ]),
    );
  } catch (err) {
    console.error("getSalesVolumeMap failed", err);
    return new Map();
  }
}

export async function userHasPurchasedProduct(
  productId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase.rpc("user_has_purchased_product", {
    p_product_id: productId,
  });
  if (error) {
    console.error("userHasPurchasedProduct failed", error.message);
    return false;
  }
  return Boolean(data);
}

export type ReviewPrompt = {
  product: Product;
  existingReview: Review | null;
};

/** Products from completed orders the signed-in user can review (or already reviewed). */
export async function getReviewPromptsForUser(
  userId: string,
): Promise<ReviewPrompt[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { createServiceClient } = await import("@/lib/supabase/admin");
    const service = createServiceClient();

    const { data: orders, error: ordersError } = await service
      .from("orders")
      .select("id, order_items(variant_id, product_name)")
      .eq("user_id", userId)
      .in("status", ["paid", "packing", "shipped", "delivered"]);

    if (ordersError || !orders?.length) return [];

    const variantIds = new Set<string>();
    const names = new Set<string>();
    for (const order of orders) {
      const items =
        (order as { order_items?: { variant_id: string | null; product_name: string }[] })
          .order_items ?? [];
      for (const item of items) {
        if (item.variant_id) variantIds.add(item.variant_id);
        if (item.product_name) names.add(item.product_name);
      }
    }

    const productIds = new Set<string>();

    if (variantIds.size > 0) {
      const { data: variants } = await service
        .from("product_variants")
        .select("product_id")
        .in("id", [...variantIds]);
      for (const v of variants ?? []) {
        productIds.add((v as { product_id: string }).product_id);
      }
    }

    if (names.size > 0) {
      const { data: byName } = await service
        .from("products")
        .select("id")
        .in("name", [...names])
        .eq("is_active", true);
      for (const p of byName ?? []) {
        productIds.add((p as { id: string }).id);
      }
    }

    if (productIds.size === 0) return [];

    const ids = [...productIds];
    const [{ data: products }, { data: reviews }] = await Promise.all([
      service
        .from("products")
        .select(
          "*, brands(*), product_variants(*), product_rating_summary(avg_rating, review_count)",
        )
        .in("id", ids)
        .eq("is_active", true),
      service
        .from("reviews")
        .select("*")
        .eq("user_id", userId)
        .in("product_id", ids),
    ]);

    const reviewByProduct = new Map(
      (reviews ?? []).map((r) => [(r as Review).product_id, r as Review]),
    );

    const prompts: ReviewPrompt[] = [];
    for (const row of products ?? []) {
      const product = normalizeProduct({
        ...(row as ProductRow),
        brands: (row as ProductRow).brands,
        product_variants: (
          row as ProductRow & { product_variants?: Product["variants"] }
        ).product_variants,
        product_rating_summary: (row as ProductRow).product_rating_summary,
      });
      prompts.push({
        product,
        existingReview: reviewByProduct.get(product.id) ?? null,
      });
    }

    // Pending reviews first, then unreviewed, then approved
    prompts.sort((a, b) => {
      const rank = (p: ReviewPrompt) => {
        if (!p.existingReview) return 0;
        if (!p.existingReview.is_approved) return 1;
        return 2;
      };
      return rank(a) - rank(b) || a.product.name.localeCompare(b.product.name);
    });

    return prompts;
  } catch (err) {
    console.error("getReviewPromptsForUser failed", err);
    return [];
  }
}

export async function getLimitedStock(limit = 4): Promise<Product[]> {
  const products = await getProducts();
  const scored = await Promise.all(
    products.map(async (p) => {
      const stock = await getStockSummary(p.id);
      const score = stock.sealedBottles * 100 + stock.openMl;
      return { p, score };
    }),
  );
  return scored
    .filter((s) => s.score > 0 && s.score < 150)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((s) => s.p);
}

export async function getApprovedReviews(
  productId?: string,
  limit = 20,
): Promise<Review[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  let query = supabase
    .from("reviews")
    .select("*")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (productId) query = query.eq("product_id", productId);
  const { data, error } = await query;
  if (error || !data) return [];
  return data as Review[];
}

export async function getStockSummary(productId: string): Promise<StockSummary> {
  if (!isSupabaseConfigured()) {
    return {
      sealedBottles: productId.endsWith("3") ? 1 : 2,
      openMl: productId.endsWith("3")
        ? 55
        : productId.endsWith("4")
          ? 30
          : productId.endsWith("5")
            ? 40
            : 72,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("product_stock_summary", {
    p_product_id: productId,
  });

  if (error || !data) {
    console.error("getStockSummary failed", error?.message);
    return { sealedBottles: 0, openMl: 0 };
  }

  const summary = data as { sealedBottles?: number; openMl?: number };
  return {
    sealedBottles: Number(summary.sealedBottles ?? 0),
    openMl: Number(summary.openMl ?? 0),
  };
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { createServiceClient } = await import("@/lib/supabase/admin");
    const service = createServiceClient();
    const { data, error } = await service
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return {
      ...(data as Order),
      items: (data as { order_items: Order["items"] }).order_items,
    };
  } catch (err) {
    console.error("getOrderById failed", err);
    return null;
  }
}

export async function getOrdersForUser(userId: string): Promise<Order[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => ({
    ...(row as Order),
    items: (row as { order_items: Order["items"] }).order_items,
  }));
}
