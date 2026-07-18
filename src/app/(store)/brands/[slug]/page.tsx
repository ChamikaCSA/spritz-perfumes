import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/store/product-card";
import { getBrandBySlug, getProducts } from "@/lib/catalog";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return { title: "Brand" };
  return {
    title: brand.name,
    description: brand.description ?? undefined,
  };
}

export default async function BrandDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const products = await getProducts({ brand: brand.slug });

  return (
    <div className="pb-20">
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

        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-20 sm:px-6 sm:pb-12 sm:pt-28 lg:px-8 lg:pt-32">
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

      <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            No fragrances from this house yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
