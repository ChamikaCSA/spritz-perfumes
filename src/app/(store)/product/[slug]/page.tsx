import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductCard } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductReviews } from "@/components/store/product-reviews";
import { NotePyramid } from "@/components/store/note-pyramid";
import { StarRating } from "@/components/store/star-rating";
import { VariantPicker } from "@/components/store/variant-picker";
import { WishlistToggle } from "@/components/store/wishlist-toggle";
import {
  getApprovedReviews,
  getProductBySlug,
  getRelatedProducts,
  getStockSummary,
} from "@/lib/catalog";
import { breadcrumbJsonLd, buildMetadata, productJsonLd } from "@/lib/seo";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ type?: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };

  const inspired = product.inspired_by?.trim();
  const description =
    product.description ??
    `${product.name}${inspired ? ` — inspired by ${inspired}` : ` — authentic ${product.brand?.name ?? "luxury"} fragrance`} with full bottles and decants, delivered across Sri Lanka.`;

  return buildMetadata({
    title: product.name,
    description,
    path: `/product/${product.slug}`,
    image: product.images?.[0],
  });
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { type } = await searchParams;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const initialType =
    type === "full_size" || type === "decant" ? type : undefined;

  const [stock, reviews, related] = await Promise.all([
    getStockSummary(product.id),
    getApprovedReviews(product.id),
    getRelatedProducts(product),
  ]);

  const metaRows: { label: string; value: string }[] = [];
  if (product.longevity)
    metaRows.push({ label: "Longevity", value: product.longevity });
  if (product.projection)
    metaRows.push({ label: "Projection", value: product.projection });
  if (product.season) metaRows.push({ label: "Season", value: product.season });
  if (product.occasion)
    metaRows.push({ label: "Occasion", value: product.occasion });
  if (product.gender)
    metaRows.push({
      label: "Gender",
      value:
        product.gender === "men"
          ? "Men"
          : product.gender === "women"
            ? "Women"
            : "Unisex",
    });
  if (product.country_of_origin)
    metaRows.push({ label: "Country", value: product.country_of_origin });
  if (product.year_released)
    metaRows.push({
      label: "Year",
      value: String(product.year_released),
    });
  if (product.perfumers?.length)
    metaRows.push({
      label: "Perfumer",
      value: product.perfumers.join(", "),
    });
  if (product.inspired_by?.trim())
    metaRows.push({
      label: "Inspired by",
      value: product.inspired_by.trim(),
    });

  const rating =
    product.avg_rating != null ? Number(product.avg_rating) : null;
  const hasNotes =
    (product.notes?.top?.length ?? 0) +
      (product.notes?.heart?.length ?? 0) +
      (product.notes?.base?.length ?? 0) >
    0;

  const breadcrumbs = [
    { name: "Shop", path: "/shop" },
    ...(product.brand
      ? [{ name: product.brand.name, path: `/brands/${product.brand.slug}` }]
      : []),
    { name: product.name, path: `/product/${product.slug}` },
  ];

  return (
    <div className="pb-14 sm:pb-20 lg:pb-24">
      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumbs),
          productJsonLd(product, stock, reviews),
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-28">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 text-xs uppercase tracking-[0.16em] text-muted-foreground lg:mb-4"
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
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-8 xl:gap-12">
          <div className="lg:sticky lg:top-24 lg:max-h-[calc(100svh-7rem)]">
            <ProductGallery images={product.images} alt={product.name} />
          </div>

          <div className="flex min-w-0 flex-col lg:min-h-0">
            <div>
              {product.brand ? (
                <Link
                  href={`/brands/${product.brand.slug}`}
                  className="text-[11px] uppercase tracking-[0.28em] text-amber hover:underline sm:text-xs"
                >
                  {product.brand.name}
                </Link>
              ) : (
                <p className="text-[11px] uppercase tracking-[0.28em] text-amber sm:text-xs">
                  Fragrance
                </p>
              )}
              <h1 className="mt-1.5 font-display text-3xl leading-[1.05] sm:mt-2 sm:text-5xl lg:text-5xl xl:text-6xl">
                {product.name}
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {product.concentration ? (
                  <p className="text-sm text-muted-foreground">
                    {product.concentration}
                  </p>
                ) : null}
                {rating != null && rating > 0 ? (
                  <a
                    href="#reviews"
                    className="inline-flex items-center gap-2 transition hover:text-amber"
                  >
                    <StarRating rating={rating} size="sm" />
                    <span className="text-sm text-muted-foreground">
                      {rating.toFixed(1)}
                      {product.review_count
                        ? ` (${product.review_count})`
                        : null}
                    </span>
                  </a>
                ) : null}
              </div>
            </div>

            {product.description ? (
              <p className="mt-5 max-w-prose text-sm leading-relaxed text-muted-foreground sm:mt-6 lg:mt-4 sm:text-base">
                {product.description}
              </p>
            ) : null}

            <div className="mt-6 sm:mt-8 lg:mt-5">
              <VariantPicker
                product={product}
                stock={stock}
                initialType={initialType}
              />
              <div className="mt-3">
                <WishlistToggle
                  productId={product.id}
                  className="w-full justify-center sm:w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {metaRows.length > 0 ? (
        <section className="mt-12 border-y border-border/40 sm:mt-16 lg:mt-20">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
            <p className="text-xs uppercase tracking-[0.3em] text-amber">
              Wear
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-4xl">
              The character
            </h2>
            <dl className="mt-6 grid grid-cols-2 border-l border-t border-border/40 sm:mt-8 sm:grid-cols-3 lg:grid-cols-4">
              {metaRows.map((row) => (
                <div
                  key={row.label}
                  className="border-b border-r border-border/40 px-3 py-3.5 sm:px-4 sm:py-4"
                >
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      {hasNotes ? (
        <section
          className={
            metaRows.length > 0
              ? "border-b border-border/40"
              : "mt-12 border-y border-border/40 sm:mt-16 lg:mt-20"
          }
        >
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
            <NotePyramid notes={product.notes} />
          </div>
        </section>
      ) : null}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ProductReviews reviews={reviews} />

        {related.length > 0 ? (
          <section className="mt-10 border-t border-border/40 pt-8 sm:mt-14 sm:pt-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-7">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.3em] text-amber">
                  More from {product.brand?.name ?? "this house"}
                </p>
                <h2 className="mt-2 font-display text-2xl sm:text-4xl">
                  Related fragrances
                </h2>
              </div>
              {product.brand ? (
                <Link
                  href={`/brands/${product.brand.slug}`}
                  className="shrink-0 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-amber"
                >
                  View house
                </Link>
              ) : null}
            </div>
            <div className="grid grid-cols-2 *:border-r *:border-b *:border-border/40 md:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  preferType={initialType}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
