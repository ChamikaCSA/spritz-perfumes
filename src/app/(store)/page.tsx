import Image from "next/image";
import Link from "next/link";
import { HomeHero } from "@/components/store/home-hero";
import { HousesMarquee } from "@/components/store/houses-marquee";
import { NewsletterForm } from "@/components/store/newsletter-form";
import { ProductCard } from "@/components/store/product-card";
import {
  getBestSellers,
  getBrands,
  getProducts,
} from "@/lib/catalog";

export default async function HomePage() {
  const [brands, newest, bestSellers] = await Promise.all([
    getBrands(),
    getProducts({ sort: "newest" }),
    getBestSellers(4),
  ]);

  const arrivalList = newest.slice(0, 4);

  return (
    <>
      <HomeHero />
      <HousesMarquee brands={brands} />

      <section className="grid md:grid-cols-2">
        <Link
          href="/shop?type=full_size"
          className="group relative min-h-[36vh] overflow-hidden sm:min-h-[52vh] md:min-h-[60vh]"
        >
          <Image
            src="/home/format-full-size.png"
            alt=""
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
          />
          <div
            className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <p className="text-xs uppercase tracking-[0.3em] text-amber">
              Path one
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl">
              Full size
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground sm:mt-3">
              Factory-sealed retail bottles — authenticity you can gift or keep.
            </p>
            <span className="mt-4 inline-block text-xs uppercase tracking-[0.2em] text-foreground transition group-hover:text-amber sm:mt-6">
              Shop full size →
            </span>
          </div>
        </Link>

        <Link
          href="/shop?type=decant"
          className="group relative min-h-[36vh] overflow-hidden border-t border-border/40 sm:min-h-[52vh] md:min-h-[60vh] md:border-l md:border-t-0"
        >
          <Image
            src="/home/format-decant.png"
            alt=""
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
          />
          <div
            className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <p className="text-xs uppercase tracking-[0.3em] text-amber">
              Path two
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl">
              Decants
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground sm:mt-3">
              2 · 5 · 10 ml pours so you can live with a scent before you commit.
            </p>
            <span className="mt-4 inline-block text-xs uppercase tracking-[0.2em] text-foreground transition group-hover:text-amber sm:mt-6">
              Shop decants →
            </span>
          </div>
        </Link>
      </section>

      <ProductRail
        eyebrow="Favourites"
        title="Best sellers"
        href="/shop?sort=popularity"
        products={bestSellers}
      />

      <section className="border-y border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.3em] text-amber">
                Maisons
              </p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl">
                Shop by brand
              </h2>
            </div>
            <Link
              href="/brands"
              className="shrink-0 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-amber"
            >
              All brands
            </Link>
          </div>
          <div className="grid grid-cols-2 [&>*]:border-r [&>*]:border-b [&>*]:border-border/40 lg:grid-cols-3">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="group relative aspect-[16/10] overflow-hidden bg-secondary/40 sm:aspect-[21/9]"
              >
                {brand.banner_url ? (
                  <Image
                    src={brand.banner_url}
                    alt=""
                    fill
                    sizes="(max-width:768px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                ) : brand.logo_url ? (
                  <div className="flex h-full items-center justify-center bg-[#f3ebe0]">
                    <Image
                      src={brand.logo_url}
                      alt=""
                      width={120}
                      height={120}
                      className="h-10 w-auto object-contain sm:h-14"
                    />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-display text-2xl text-muted-foreground/40 sm:text-3xl">
                      {brand.name.slice(0, 1)}
                    </span>
                  </div>
                )}
                <div
                  className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-4">
                  <span className="block truncate font-display text-base text-foreground transition group-hover:text-amber sm:text-2xl">
                    {brand.name}
                  </span>
                  {brand.country ? (
                    <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {brand.country}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ProductRail
        eyebrow="Just in"
        title="New arrivals"
        href="/shop?sort=newest"
        products={arrivalList}
      />

      <section className="relative overflow-hidden border-t border-border/40">
        <Image
          src="/home/newsletter-wash.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div
          className="absolute inset-0 bg-background/70"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-amber">
              Stay close
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl">
              Newsletter
            </h2>
            <p className="mt-3 text-muted-foreground sm:mt-4">
              New drops, restocks, and quiet sales — a short note when it
              matters.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}

function ProductRail({
  eyebrow,
  title,
  href,
  products,
}: {
  eyebrow: string;
  title: string;
  href: string;
  products: Awaited<ReturnType<typeof getProducts>>;
}) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.3em] text-amber">
              {eyebrow}
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl">
              {title}
            </h2>
          </div>
          <Link
            href={href}
            className="shrink-0 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-amber"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 [&>*]:border-r [&>*]:border-b [&>*]:border-border/40 md:grid-cols-4">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
