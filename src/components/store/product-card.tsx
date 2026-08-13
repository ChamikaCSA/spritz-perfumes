"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ImageEdgeFade } from "@/components/store/image-edge-fade";
import { homeEase, homeViewport } from "@/components/store/home-motion";
import { StarRating } from "@/components/store/star-rating";
import type { Product, VariantType } from "@/lib/types";
import { FromPrice } from "@/components/store/store-price";
import { cn } from "@/lib/utils";

function productHref(slug: string, preferType?: VariantType) {
  if (preferType === "full_size" || preferType === "decant") {
    return `/product/${slug}?type=${preferType}`;
  }
  return `/product/${slug}`;
}

export function ProductCard({
  product,
  index = 0,
  preferType,
  layout = "tile",
  rank,
}: {
  product: Product;
  index?: number;
  preferType?: VariantType;
  layout?: "tile" | "row";
  rank?: number;
}) {
  const hasDecant = product.variants?.some((v) => v.type === "decant");
  const hasBottle = product.variants?.some((v) => v.type === "full_size");
  const rating = product.avg_rating != null ? Number(product.avg_rating) : null;
  const reduceMotion = useReducedMotion();
  const href = productHref(product.slug, preferType);

  const meta = (
    <>
      {rank != null ? (
        <p className="text-[10px] uppercase tracking-[0.24em] text-amber-soft/80">
          No. {String(rank).padStart(2, "0")}
        </p>
      ) : null}
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {product.brand?.name}
      </p>
      <h3
        className={cn(
          "font-display leading-tight transition group-hover:text-amber",
          layout === "row" ? "text-lg sm:text-xl" : "text-lg",
        )}
      >
        {product.name}
      </h3>
      <p className="text-sm text-muted-foreground">
        {product.concentration} · <FromPrice variants={product.variants} />
      </p>
      <div className="flex min-h-5 items-center gap-1.5 pt-0.5">
        {rating != null && rating > 0 ? (
          <>
            <StarRating rating={rating} />
            <span className="text-[11px] text-muted-foreground">
              {rating.toFixed(1)}
              {product.review_count ? ` · ${product.review_count}` : null}
            </span>
          </>
        ) : null}
      </div>
    </>
  );

  if (layout === "row") {
    return (
      <article className="bg-background">
        <Link
          href={href}
          className="group flex items-center gap-3 py-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-amber/50 sm:gap-5 sm:py-4"
        >
          <div className="relative aspect-4/5 w-20 shrink-0 overflow-hidden bg-background sm:w-24">
            <Image
              src={product.images[0] ?? "/products/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="96px"
            />
            <ImageEdgeFade />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            {meta}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {hasBottle ? (
                <span className="text-[10px] uppercase tracking-wider text-amber">
                  Full size
                </span>
              ) : null}
              {hasDecant ? (
                <span className="text-[10px] uppercase tracking-wider text-amber">
                  Decant
                </span>
              ) : null}
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={homeViewport}
      transition={{
        duration: 0.55,
        delay: Math.min(index, 12) * 0.06,
        ease: homeEase,
      }}
      className="bg-background"
    >
      <Link
        href={href}
        className="group block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-amber/50"
      >
        <div className="relative aspect-4/5 overflow-hidden bg-background">
          <Image
            src={product.images[0] ?? "/products/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition duration-700 ease-out group-hover:scale-105"
            sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, (max-width:1280px) 25vw, 20vw"
          />
          <ImageEdgeFade />
          <div className="absolute inset-0 z-1 bg-linear-to-t from-background/70 via-transparent to-transparent opacity-80 transition duration-500 group-hover:opacity-40" />
          <div className="absolute bottom-3 left-3 z-2 flex gap-2">
            {hasBottle && (
              <span className="bg-ink/70 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-soft backdrop-blur-sm">
                Full size
              </span>
            )}
            {hasDecant && (
              <span className="bg-ink/70 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-soft backdrop-blur-sm">
                Decant
              </span>
            )}
          </div>
          <span className="pointer-events-none absolute right-3 top-3 z-2 translate-y-1 text-[10px] uppercase tracking-[0.28em] text-amber-soft opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            Explore →
          </span>
        </div>
        <div className="space-y-1 px-2.5 pb-3 pt-2.5 transition duration-300 group-hover:translate-x-0.5">
          {meta}
        </div>
      </Link>
    </motion.article>
  );
}
