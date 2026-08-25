import { cookies } from "next/headers";
import { PaginationNav } from "@/components/shared/pagination-nav";
import {
  CatalogBrandResults,
  CatalogStyleProvider,
  CatalogStyleToggle,
} from "@/components/store/catalog/catalog-style";
import { getBrandPage } from "@/lib/catalog";
import {
  CATALOG_STYLE_COOKIE,
  parseCatalogStyle,
} from "@/lib/catalog/style";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Brands",
  description:
    "Explore luxury fragrance houses at Spritz Perfumes — Chanel, Dior, Creed, Tom Ford, and more. Full bottles and decants in Sri Lanka.",
  path: "/brands",
});

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const catalogStyle = parseCatalogStyle(
    (await cookies()).get(CATALOG_STYLE_COOKIE)?.value,
  );
  const result = await getBrandPage(parsePage(page), PAGE_SIZE.brands);
  const brands = result.items;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pt-32">
      <div className="mb-6 sm:mb-10 lg:mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-amber">Houses</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl lg:text-6xl">Brands</h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          Explore the maisons we stock — from heritage classics to contemporary
          niche.
        </p>
      </div>

      <CatalogStyleProvider initialStyle={catalogStyle}>
        <div className="mb-4 flex justify-end sm:mb-6">
          <CatalogStyleToggle />
        </div>
        <CatalogBrandResults brands={brands} />
        <PaginationNav
          page={result.page}
          pageCount={result.pageCount}
          total={result.total}
          pageSize={result.pageSize}
          pathname="/brands"
        />
      </CatalogStyleProvider>
    </div>
  );
}
