"use client";

import Image from "next/image";
import { useState } from "react";
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
      <div className="relative aspect-square overflow-hidden bg-muted mist-glow sm:aspect-4/5">
        <Image
          src={current}
          alt={alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width:1024px) 100vw, 50vw"
        />
      </div>
      {list.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative h-14 w-12 shrink-0 overflow-hidden border transition sm:h-20 sm:w-16",
                i === active
                  ? "border-amber"
                  : "border-border opacity-70 hover:opacity-100",
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
