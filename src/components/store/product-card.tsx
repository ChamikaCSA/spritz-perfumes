"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { StarRating } from "@/components/store/star-rating";
import type { Product } from "@/lib/types";
import { formatLkr, lowestPrice } from "@/lib/utils-commerce";

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const from = lowestPrice(product.variants);
  const hasDecant = product.variants?.some((v) => v.type === "decant");
  const hasBottle = product.variants?.some((v) => v.type === "full_size");
  const rating = product.avg_rating != null ? Number(product.avg_rating) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <Link href={`/product/${product.slug}`} className="group block">
        <div className="relative aspect-4/5 overflow-hidden bg-muted">
          <Image
            src={product.images[0] ?? "/products/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width:768px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent opacity-60 transition group-hover:opacity-40" />
          <div className="absolute bottom-3 left-3 flex gap-2">
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
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {product.brand?.name}
          </p>
          <h3 className="font-display text-xl leading-tight group-hover:text-amber">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {product.concentration} · from {formatLkr(from)}
          </p>
          {rating != null && rating > 0 ? (
            <div className="flex items-center gap-1.5 pt-0.5">
              <StarRating rating={rating} />
              <span className="text-[11px] text-muted-foreground">
                {rating.toFixed(1)}
                {product.review_count
                  ? ` · ${product.review_count}`
                  : null}
              </span>
            </div>
          ) : null}
        </div>
      </Link>
    </motion.article>
  );
}
