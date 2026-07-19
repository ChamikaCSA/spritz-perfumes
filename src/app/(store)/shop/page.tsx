import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { ShopToolbar } from "@/components/store/shop-toolbar";
import { getProducts } from "@/lib/catalog";
import type { ProductGender, ProductSort, ProductSortOrder } from "@/lib/types";
import { defaultSortOrder } from "@/lib/types";

type SearchParams = Promise<{
  brand?: string;
  concentration?: string;
  type?: string;
  q?: string;
  gender?: string;
  note?: string;
  size_ml?: string;
  min_price?: string;
  max_price?: string;
  available?: string;
  sort?: string;
  order?: string;
}>;

export const metadata = { title: "Shop" };

const SORT_VALUES: ProductSort[] = [
  "name",
  "newest",
  "price",
  "popularity",
  "rating",
];

function parseSortParams(params: {
  sort?: string;
  order?: string;
}): { sort?: ProductSort; order?: ProductSortOrder } {
  // Legacy combined values
  if (params.sort === "price_asc") return { sort: "price", order: "asc" };
  if (params.sort === "price_desc") return { sort: "price", order: "desc" };

  const sort = SORT_VALUES.includes(params.sort as ProductSort)
    ? (params.sort as ProductSort)
    : undefined;
  const order: ProductSortOrder | undefined =
    params.order === "asc" || params.order === "desc"
      ? params.order
      : undefined;

  return {
    sort,
    order: order ?? (sort ? defaultSortOrder(sort) : undefined),
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { sort, order } = parseSortParams(params);
  const products = await getProducts({
    brand: params.brand,
    concentration: params.concentration,
    type: params.type,
    q: params.q,
    gender: params.gender as ProductGender | undefined,
    note: params.note,
    size_ml: params.size_ml,
    min_price: params.min_price,
    max_price: params.max_price,
    available: params.available,
    sort,
    order,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pt-32">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber">Catalog</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl lg:text-6xl">Shop</h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          Full size and decants. Prefer a house?{" "}
          <Link href="/brands" className="text-amber hover:underline">
            Browse by brand
          </Link>
          .
        </p>
      </div>

      <ShopToolbar
        params={{
          ...params,
          sort: sort && sort !== "name" ? sort : undefined,
          order:
            order && order !== defaultSortOrder(sort ?? "name")
              ? order
              : undefined,
        }}
        resultCount={products.length}
      />

      {products.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No fragrances match these filters.
        </p>
      ) : (
        <div className="grid grid-cols-2 *:border-r *:border-b *:border-border/40 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              preferType={
                params.type === "full_size" || params.type === "decant"
                  ? params.type
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
