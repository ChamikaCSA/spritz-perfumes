"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ImageEdgeFade } from "@/components/store/image-edge-fade";
import { homeEase, homeViewport } from "@/components/store/home-motion";
import { StarRating } from "@/components/store/star-rating";
import type { Product, VariantType } from "@/lib/types";
import { formatLkr, lowestPrice } from "@/lib/utils-commerce";

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
}: {
  product: Product;
  index?: number;
  preferType?: VariantType;
}) {
  const from = lowestPrice(product.variants);
  const hasDecant = product.variants?.some((v) => v.type === "decant");
  const hasBottle = product.variants?.some((v) => v.type === "full_size");
  const rating = product.avg_rating != null ? Number(product.avg_rating) : null;
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={homeViewport}
      transition={{ duration: 0.55, delay: index * 0.06, ease: homeEase }}
      className="bg-background"
    >
      <Link
        href={productHref(product.slug, preferType)}
        className="group block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-amber/50"
      >
        <div className="relative aspect-4/5 overflow-hidden bg-background">
          <Image
            src={product.images[0] ?? "/products/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition duration-700 ease-out group-hover:scale-105"
            sizes="(max-width:768px) 50vw, 25vw"
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
        <div className="space-y-1 px-3 pb-4 pt-3 transition duration-300 group-hover:translate-x-0.5">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {product.brand?.name}
          </p>
          <h3 className="font-display text-xl leading-tight transition group-hover:text-amber">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {product.concentration} · from {formatLkr(from)}
          </p>
          <div className="flex min-h-5 items-center gap-1.5 pt-0.5">
            {rating != null && rating > 0 ? (
              <>
                <StarRating rating={rating} />
                <span className="text-[11px] text-muted-foreground">
                  {rating.toFixed(1)}
                  {product.review_count
                    ? ` · ${product.review_count}`
                    : null}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
