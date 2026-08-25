import Link from "next/link";
import { cookies } from "next/headers";
import { PaginationNav } from "@/components/shared/pagination-nav";
import {
  CatalogProductResults,
  CatalogStyleProvider,
} from "@/components/store/catalog/catalog-style";
import { ShopToolbar } from "@/components/store/catalog/shop-toolbar";
import { getProductPage } from "@/lib/catalog";
import {
  CATALOG_STYLE_COOKIE,
  parseCatalogStyle,
} from "@/lib/catalog/style";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { buildMetadata } from "@/lib/seo";
import type { ProductGender, ProductSort, ProductSortOrder } from "@/types";
import { defaultSortOrder } from "@/lib/catalog/sort";

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
  page?: string;
}>;

export const metadata = buildMetadata({
  title: "Shop",
  description:
    "Browse luxury fragrances, decants, and full bottles from the world's finest houses. Filter by brand, note, and size — delivered across Sri Lanka.",
  path: "/shop",
});

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
  const catalogStyle = parseCatalogStyle(
    (await cookies()).get(CATALOG_STYLE_COOKIE)?.value,
  );
  const { sort, order } = parseSortParams(params);
  const page = parsePage(params.page);
  const result = await getProductPage({
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
    page,
    pageSize: PAGE_SIZE.shop,
  });

  const query = {
    brand: params.brand,
    concentration: params.concentration,
    type: params.type,
    q: params.q,
    gender: params.gender,
    note: params.note,
    size_ml: params.size_ml,
    min_price: params.min_price,
    max_price: params.max_price,
    available: params.available,
    sort: sort && sort !== "name" ? sort : undefined,
    order:
      order && order !== defaultSortOrder(sort ?? "name") ? order : undefined,
  };

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

      <CatalogStyleProvider initialStyle={catalogStyle}>
        <ShopToolbar
          params={query}
          resultCount={result.total}
          page={result.page}
          pageSize={result.pageSize}
        />

        {result.items.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            No fragrances match these filters.
          </p>
        ) : (
          <>
            <CatalogProductResults
              products={result.items}
              preferType={
                params.type === "full_size" || params.type === "decant"
                  ? params.type
                  : undefined
              }
            />
            <PaginationNav
              page={result.page}
              pageCount={result.pageCount}
              total={result.total}
              pageSize={result.pageSize}
              pathname="/shop"
              query={query}
            />
          </>
        )}
      </CatalogStyleProvider>
    </div>
  );
}
