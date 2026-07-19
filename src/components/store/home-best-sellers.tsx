"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ImageEdgeFade } from "@/components/store/image-edge-fade";
import { homeEase, homeViewport } from "@/components/store/home-motion";
import { ProductCard } from "@/components/store/product-card";
import type { Product } from "@/lib/types";
import { formatLkr, lowestPrice } from "@/lib/utils-commerce";

function BestSellerLead({ product }: { product: Product }) {
  const from = lowestPrice(product.variants);
  const href = `/product/${product.slug}`;
  const reduceMotion = useReducedMotion();
  const notes = [
    ...(product.notes?.top?.slice(0, 2) ?? []),
    ...(product.notes?.heart?.slice(0, 1) ?? []),
  ].slice(0, 3);

  return (
    <div className="relative grid items-center gap-6 sm:gap-8 md:grid-cols-2 md:gap-10 lg:gap-14">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={homeViewport}
        transition={{ duration: 0.85, ease: homeEase }}
      >
        <Link
          href={href}
          className="group relative mx-auto block aspect-4/5 w-full max-w-sm overflow-hidden bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber/50 md:mx-0 md:max-w-none"
        >
          <Image
            src={product.images[0] ?? "/products/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width:768px) 384px, 50vw"
            className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.04]"
          />
          <ImageEdgeFade />
          <div
            className="absolute inset-0 z-1 bg-linear-to-t from-background via-background/25 to-transparent transition duration-500 group-hover:via-background/10"
            aria-hidden
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 z-2 translate-y-2 px-4 pb-4 text-center text-[10px] uppercase tracking-[0.28em] text-amber-soft opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            View bottle
          </span>
        </Link>
      </motion.div>

      <div className="min-w-0">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={homeViewport}
          transition={{ duration: 0.4 }}
          className="text-xs uppercase tracking-[0.28em] text-amber"
        >
          No. 01 · Customer favourite
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={homeViewport}
          transition={{ duration: 0.4, delay: 0.04 }}
          className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground"
        >
          {product.brand?.name}
        </motion.p>
        <motion.h3
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={homeViewport}
          transition={{ duration: 0.6, ease: homeEase, delay: 0.06 }}
          className="mt-1.5 font-display text-3xl leading-[0.98] tracking-tight sm:text-4xl lg:text-[2.75rem]"
        >
          <Link
            href={href}
            className="transition hover:text-amber focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber/50"
          >
            {product.name}
          </Link>
        </motion.h3>
        {product.description ? (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={homeViewport}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            {product.description}
          </motion.p>
        ) : null}

        {notes.length > 0 ? (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={homeViewport}
            transition={{ duration: 0.35, delay: 0.14 }}
            className="mt-4 text-sm tracking-wide text-amber-soft"
          >
            {notes.join(" · ")}
          </motion.p>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={homeViewport}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-7 flex flex-col gap-4 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5"
        >
          <Link
            href={href}
            className="group relative inline-flex h-12 w-full items-center justify-center overflow-hidden bg-amber px-7 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-soft sm:w-auto"
          >
            <span className="absolute inset-0 origin-left scale-x-0 bg-amber-soft transition duration-500 group-hover:scale-x-100" />
            <span className="relative">Shop this bottle</span>
          </Link>
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            {product.concentration} · from {formatLkr(from)}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export function HomeBestSellers({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  const [lead, ...rest] = products;

  return (
    <section
      aria-labelledby="home-bestsellers-heading"
      className="relative overflow-hidden border-t border-border/40"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-[22%] h-[55%] w-[70%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.1),transparent_68%)] blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-12">
          <div className="min-w-0">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={homeViewport}
              transition={{ duration: 0.5 }}
              className="text-xs uppercase tracking-[0.3em] text-amber"
            >
              Selling fast
            </motion.p>
            <motion.h2
              id="home-bestsellers-heading"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={homeViewport}
              transition={{
                duration: 0.7,
                delay: 0.06,
                ease: homeEase,
              }}
              className="mt-2 font-display text-3xl tracking-tight sm:text-4xl lg:text-5xl"
            >
              Best sellers
            </motion.h2>
          </div>
          <Link
            href="/shop?sort=popularity"
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition hover:text-amber focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber/50"
          >
            See all favourites
            <span
              aria-hidden
              className="transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>

        <div className="relative">
          <BestSellerLead product={lead} />

          {rest.length > 0 ? (
            <div className="mt-10 grid grid-cols-2 border-t border-l border-border/40 sm:mt-12 md:grid-cols-3 lg:grid-cols-4">
              {rest.map((product, i) => (
                <div
                  key={product.id}
                  className="border-r border-b border-border/40"
                >
                  <ProductCard product={product} index={i} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
