import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { PaginationNav } from "@/components/store/pagination-nav";
import {
  CatalogProductResults,
  CatalogStyleProvider,
  CatalogStyleToggle,
} from "@/components/store/catalog-style";
import { getBrandBySlug, getProductPage } from "@/lib/catalog";
import {
  CATALOG_STYLE_COOKIE,
  parseCatalogStyle,
} from "@/lib/catalog-style";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import {
  brandJsonLd,
  breadcrumbJsonLd,
  buildMetadata,
} from "@/lib/seo";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ page?: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return { title: "Brand" };

  const description =
    brand.description ??
    `Shop ${brand.name} fragrances at Spritz Perfumes — authentic full bottles and decants delivered across Sri Lanka.`;

  return buildMetadata({
    title: brand.name,
    description,
    path: `/brands/${brand.slug}`,
    image: brand.banner_url ?? brand.logo_url,
  });
}

export default async function BrandDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const catalogStyle = parseCatalogStyle(
    (await cookies()).get(CATALOG_STYLE_COOKIE)?.value,
  );
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const result = await getProductPage({
    brand: brand.slug,
    page: parsePage(pageParam),
    pageSize: PAGE_SIZE.brand,
  });
  const products = result.items;

  const breadcrumbs = [
    { name: "Brands", path: "/brands" },
    { name: brand.name, path: `/brands/${brand.slug}` },
  ];

  return (
    <div className="pb-20">
      <JsonLd
        data={[breadcrumbJsonLd(breadcrumbs), ...brandJsonLd(brand, products)]}
      />
      <section className="relative isolate overflow-hidden border-b border-border/40">
        {brand.banner_url ? (
          <>
            <Image
              src={brand.banner_url}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-40"
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(12,11,10,0.55)_55%,rgba(12,11,10,0.92)_100%)]"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-background/40"
              aria-hidden
            />
          </>
        ) : (
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -left-1/4 top-1/4 h-[45vh] w-[50vw] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.14),transparent_70%)] blur-2xl" />
            <div className="absolute -right-1/4 top-0 h-[50vh] w-[45vw] rounded-full bg-[radial-gradient(circle,rgba(120,80,30,0.2),transparent_65%)] blur-3xl" />
          </div>
        )}

        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 sm:pb-12 sm:pt-28 lg:px-8 lg:pt-32">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 text-xs uppercase tracking-[0.16em] text-muted-foreground"
          >
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.path} className="flex items-center gap-2">
                  {index > 0 ? <span aria-hidden>·</span> : null}
                  {index < breadcrumbs.length - 1 ? (
                    <Link href={crumb.path} className="hover:text-amber">
                      {crumb.name}
                    </Link>
                  ) : (
                    <span className="text-foreground">{crumb.name}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8">
            {brand.logo_url ? (
              <div className="relative size-24 shrink-0 overflow-hidden bg-[#f3ebe0] shadow-[0_0_0_1px_rgba(212,175,55,0.15)] sm:size-28">
                <Image
                  src={brand.logo_url}
                  alt={`${brand.name} logo`}
                  fill
                  sizes="112px"
                  className="object-contain p-3"
                />
              </div>
            ) : null}
            <div className="min-w-0 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-amber">
                House
              </p>
              <h1 className="mt-2 font-display text-4xl sm:text-5xl lg:text-6xl">
                {brand.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {brand.country ? <span>{brand.country}</span> : null}
                {brand.country && brand.website ? (
                  <span aria-hidden>·</span>
                ) : null}
                {brand.website ? (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber"
                  >
                    Official site
                  </a>
                ) : null}
              </div>
              {brand.description ? (
                <p className="mt-4 max-w-xl text-muted-foreground">
                  {brand.description}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            No fragrances from this house yet.
          </p>
        ) : (
          <>
            <CatalogStyleProvider initialStyle={catalogStyle}>
              <div className="mb-4 flex justify-end sm:mb-6">
                <CatalogStyleToggle />
              </div>
              <CatalogProductResults products={products} />
              <PaginationNav
                page={result.page}
                pageCount={result.pageCount}
                total={result.total}
                pageSize={result.pageSize}
                pathname={`/brands/${brand.slug}`}
              />
            </CatalogStyleProvider>
          </>
        )}
      </div>
    </div>
  );
}
