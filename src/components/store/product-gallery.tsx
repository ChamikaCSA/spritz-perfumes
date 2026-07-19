"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageEdgeFade } from "@/components/store/image-edge-fade";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const list =
    images.length > 0 ? images : ["/products/placeholder.svg"];
  const [active, setActive] = useState(0);
  const current = list[Math.min(active, list.length - 1)];

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="relative aspect-square overflow-hidden bg-background mist-glow sm:aspect-4/5">
        <Image
          src={current}
          alt={alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width:1024px) 100vw, 50vw"
        />
        <ImageEdgeFade size="lg" />
        <div
          className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-background/50 via-transparent to-background/15"
          aria-hidden
        />
      </div>
      {list.length > 1 ? (
        <div className="flex gap-px overflow-x-auto bg-border/40 scrollbar-none">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative h-14 w-12 shrink-0 overflow-hidden bg-background transition sm:h-20 sm:w-16",
                i === active
                  ? "ring-1 ring-inset ring-amber"
                  : "opacity-70 hover:opacity-100",
              )}
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === active}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
              <ImageEdgeFade size="sm" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
