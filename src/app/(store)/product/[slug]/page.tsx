import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductReviews } from "@/components/store/product-reviews";
import { ScentPyramid } from "@/components/store/scent-pyramid";
import { StarRating } from "@/components/store/star-rating";
import { VariantPicker } from "@/components/store/variant-picker";
import { WishlistToggle } from "@/components/store/wishlist-toggle";
import {
  getApprovedReviews,
  getProductBySlug,
  getRelatedProducts,
  getStockSummary,
} from "@/lib/catalog";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

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
  if (product.gender) metaRows.push({ label: "Gender", value: product.gender });
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

  const rating =
    product.avg_rating != null ? Number(product.avg_rating) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-14 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pb-24 lg:pt-32">
      <div className="grid gap-5 lg:grid-cols-2 lg:items-start lg:gap-12 xl:gap-16">
        <div className="lg:sticky lg:top-24">
          <ProductGallery images={product.images} alt={product.name} />
        </div>

        <div className="flex min-w-0 flex-col">
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
            <h1 className="mt-1.5 font-display text-3xl leading-[1.05] sm:mt-2 sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              {product.concentration ? (
                <p className="text-sm text-muted-foreground">
                  {product.concentration}
                </p>
              ) : null}
              {rating != null && rating > 0 ? (
                <div className="flex items-center gap-2">
                  <StarRating rating={rating} size="sm" />
                  <span className="text-sm text-muted-foreground">
                    {rating.toFixed(1)}
                    {product.review_count
                      ? ` (${product.review_count})`
                      : null}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-5 sm:mt-6">
            <VariantPicker product={product} stock={stock} />
            <div className="mt-3">
              <WishlistToggle productId={product.id} />
            </div>
          </div>

          {product.description ? (
            <p className="mt-5 max-w-prose text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-base">
              {product.description}
            </p>
          ) : null}

          {metaRows.length > 0 ? (
            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/70 pt-5 sm:mt-6 sm:grid-cols-3 sm:gap-y-4 sm:pt-6">
              {metaRows.map((row) => (
                <div key={row.label}>
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd className="mt-0.5 text-sm capitalize">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="mt-5 border-t border-border/70 pt-5 sm:mt-6 sm:pt-6">
            <ScentPyramid notes={product.notes} />
          </div>
        </div>
      </div>

      <ProductReviews reviews={reviews} />

      {related.length > 0 ? (
        <section className="mt-10 border-t border-border pt-8 sm:mt-14 sm:pt-10">
          <p className="text-xs uppercase tracking-[0.3em] text-amber">
            More from {product.brand?.name ?? "this house"}
          </p>
          <h2 className="mt-2 font-display text-2xl sm:text-4xl">
            Related scents
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-7 sm:gap-4 md:grid-cols-4 md:gap-6">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
