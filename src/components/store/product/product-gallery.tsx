"use client";

import Image from "next/image";
import { useRef, useState, type TouchEvent } from "react";
import { ImageEdgeFade } from "@/components/store/catalog/image-edge-fade";
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
  const multi = list.length > 1;
  const touchStartX = useRef<number | null>(null);

  function go(delta: number) {
    setActive((i) => (i + delta + list.length) % list.length);
  }

  function onTouchStart(e: TouchEvent) {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: TouchEvent) {
    if (touchStartX.current == null || !multi) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    go(dx < 0 ? 1 : -1);
  }

  return (
    <div
      className="group relative aspect-square select-none overflow-hidden bg-background mist-glow sm:aspect-4/5 lg:max-h-[calc(100svh-11rem)]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <Image
        src={current}
        alt={alt}
        fill
        priority
        className="object-cover"
        sizes="(max-width:1024px) 100vw, 50vw"
        draggable={false}
      />
      <ImageEdgeFade size="lg" />
      <div
        className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-background/70 via-transparent to-background/15"
        aria-hidden
      />

      {multi ? (
        <div
          className="absolute inset-x-0 bottom-0 z-2 flex items-end gap-1.5 p-3 sm:gap-2 sm:p-4"
          role="tablist"
          aria-label="Product images"
        >
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Image ${i + 1} of ${list.length}`}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-4/5 w-11 overflow-hidden transition sm:w-14",
                i === active
                  ? "opacity-100 ring-1 ring-inset ring-amber"
                  : "opacity-45 hover:opacity-90",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="56px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
