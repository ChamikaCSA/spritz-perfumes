"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ImageEdgeFade } from "@/components/store/image-edge-fade";
import { homeEase, homeViewport } from "@/components/store/home-motion";
import { FromPrice } from "@/components/store/store-price";
import type { Product } from "@/lib/types";

export function HomeProductTile({
  product,
  index = 0,
  rank,
}: {
  product: Product;
  index?: number;
  rank?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={homeViewport}
      transition={{
        duration: 0.55,
        delay: Math.min(index, 8) * 0.05,
        ease: homeEase,
      }}
    >
      <Link
        href={`/product/${product.slug}`}
        className="group relative block aspect-4/5 overflow-hidden bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-amber/50"
      >
        <Image
          src={product.images[0] ?? "/products/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.05]"
        />
        <ImageEdgeFade />
        <div
          className="absolute inset-0 bg-linear-to-t from-background/95 via-background/30 to-transparent transition duration-500 group-hover:from-background"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 z-2 p-3 transition duration-500 group-hover:-translate-y-0.5 sm:p-4">
          {rank != null ? (
            <p className="text-[10px] uppercase tracking-[0.24em] text-amber-soft/80">
              No. {String(rank).padStart(2, "0")}
            </p>
          ) : null}
          {product.brand?.name ? (
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
              {product.brand.name}
            </p>
          ) : null}
          <h3 className="mt-0.5 truncate font-display text-base tracking-tight text-foreground transition group-hover:text-amber sm:text-xl">
            {product.name}
          </h3>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-sm text-muted-foreground">
              {product.concentration ? `${product.concentration} · ` : null}
              <FromPrice variants={product.variants} />
            </p>
            <span
              aria-hidden
              className="translate-x-1 text-xs text-amber opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            >
              →
            </span>
          </div>
        </div>
        <span className="sr-only">Shop {product.name}</span>
      </Link>
    </motion.article>
  );
}
