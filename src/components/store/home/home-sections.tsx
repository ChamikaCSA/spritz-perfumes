"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { NewsletterForm } from "@/components/store/layout/newsletter-form";
import { homeEase, homeViewport } from "@/components/store/home/home-motion";
import { HomeProductTile } from "@/components/store/home/home-product-tile";
import type { Brand, Product } from "@/types";

export function HomeSectionHeader({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
}: {
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-12">
      <div className="min-w-0">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={homeViewport}
          transition={{ duration: 0.5 }}
          className="text-xs uppercase tracking-[0.3em] text-amber"
        >
          {eyebrow}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={homeViewport}
          transition={{ duration: 0.7, delay: 0.06, ease: homeEase }}
          className="mt-2 font-display text-3xl tracking-tight sm:text-4xl lg:text-5xl"
        >
          {title}
        </motion.h2>
      </div>
      {href ? (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={homeViewport}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Link
            href={href}
            className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-xs uppercase tracking-[0.2em] text-muted-foreground transition hover:text-amber focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber/50"
          >
            {linkLabel}
            <span
              aria-hidden
              className="transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </motion.div>
      ) : null}
    </div>
  );
}

export function HomeProductRail({
  eyebrow,
  title,
  href,
  products,
  linkLabel = "View all",
}: {
  eyebrow: string;
  title: string;
  href: string;
  products: Product[];
  linkLabel?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-border/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24">
        <HomeSectionHeader
          eyebrow={eyebrow}
          title={title}
          href={href}
          linkLabel={linkLabel}
        />
        <div className="grid grid-cols-2 border-t border-l border-border/40 md:grid-cols-4">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="border-r border-b border-border/40"
            >
              <HomeProductTile product={product} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function completeRowCount(total: number, cols: number) {
  if (cols <= 0 || total <= 0) return total;
  const complete = Math.floor(total / cols) * cols;
  return complete > 0 ? complete : total;
}

function useCompleteRowCount(total: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [limit, setLimit] = useState(() => completeRowCount(total, 2));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const cols = getComputedStyle(el)
        .gridTemplateColumns.split(/\s+/)
        .filter(Boolean).length;
      setLimit(completeRowCount(total, cols));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [total]);

  return { ref, limit };
}

export function HomeBrandGrid({ brands }: { brands: Brand[] }) {
  const { ref, limit } = useCompleteRowCount(brands.length);
  const shown = brands.slice(0, limit);

  if (brands.length === 0) return null;

  return (
    <section className="border-y border-border/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24">
        <HomeSectionHeader
          eyebrow="Curated houses"
          title="Shop by brand"
          href="/brands"
          linkLabel="See all maisons"
        />
        <div
          ref={ref}
          className="grid grid-cols-2 border-t border-l border-border/40 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {shown.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={homeViewport}
              transition={{
                duration: 0.55,
                delay: i * 0.05,
                ease: homeEase,
              }}
              className="border-r border-b border-border/40"
            >
              <Link
                href={`/brands/${brand.slug}`}
                className="group relative block aspect-16/10 overflow-hidden bg-secondary/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-amber/50 sm:aspect-21/9"
              >
                {brand.banner_url ? (
                  <Image
                    src={brand.banner_url}
                    alt=""
                    fill
                    sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, (max-width:1280px) 25vw, 20vw"
                    className="object-cover transition duration-700 ease-out group-hover:scale-[1.05]"
                  />
                ) : brand.logo_url ? (
                  <div className="flex h-full items-center justify-center bg-secondary">
                    <Image
                      src={brand.logo_url}
                      alt=""
                      width={120}
                      height={120}
                      className="h-10 w-auto object-contain opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100 sm:h-14"
                    />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center bg-secondary/60">
                    <span className="font-display text-2xl text-muted-foreground/40 transition group-hover:text-amber/50 sm:text-3xl">
                      {brand.name.slice(0, 1)}
                    </span>
                  </div>
                )}
                <div
                  className="absolute inset-0 bg-linear-to-t from-background/95 via-background/25 to-transparent transition duration-500 group-hover:from-background"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-3 transition duration-500 group-hover:-translate-y-0.5 sm:p-4">
                  <span className="block truncate font-display text-base tracking-tight text-foreground transition group-hover:text-amber sm:text-2xl">
                    {brand.name}
                  </span>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    {brand.country ? (
                      <p className="truncate text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {brand.country}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span
                      aria-hidden
                      className="translate-x-1 text-xs text-amber opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                    >
                      →
                    </span>
                  </div>
                </div>
                <span className="sr-only">Shop {brand.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeNewsletter() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);

  return (
    <section
      ref={ref}
      aria-labelledby="home-newsletter-heading"
      className="relative overflow-hidden border-t border-border/40"
    >
      <motion.div
        style={reduceMotion ? undefined : { y: imageY, scale: imageScale }}
        className="absolute inset-0 will-change-transform"
      >
        <Image
          src="/home/newsletter-wash.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-80"
        />
      </motion.div>
      <div className="absolute inset-0 bg-background/70" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={homeViewport}
          transition={{ duration: 0.8, ease: homeEase }}
          className="mx-auto max-w-xl text-center"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-amber">
            Early access
          </p>
          <h2
            id="home-newsletter-heading"
            className="mt-2 font-display text-3xl tracking-tight sm:text-4xl lg:text-5xl"
          >
            Get the drops first
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
            New arrivals, restocks, and members-only offers. Straight to your
            inbox before they sell out.
          </p>
          <NewsletterForm className="mx-auto" />
        </motion.div>
      </div>
    </section>
  );
}
