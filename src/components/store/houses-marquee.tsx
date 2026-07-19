import type { Brand } from "@/lib/types";

type HousesMarqueeProps = {
  brands: Brand[];
};

function MarqueeTrack({
  brands,
  pass,
}: {
  brands: Brand[];
  pass: number;
}) {
  return (
    <ul
      className="flex shrink-0 items-baseline gap-6 px-3 sm:gap-10 sm:px-5"
      aria-hidden={pass > 0 || undefined}
    >
      {brands.map((brand, i) => (
        <li
          key={`${pass}-${brand.id}-${i}`}
          className="flex shrink-0 items-baseline gap-6 sm:gap-10"
        >
          <span
            className={`font-display text-lg tracking-tight sm:text-xl lg:text-2xl ${
              i % 3 === 0
                ? "text-amber-soft/90"
                : i % 3 === 1
                  ? "text-foreground/75"
                  : "text-muted-foreground/60"
            }`}
          >
            {brand.name}
          </span>
          <span className="text-amber/35" aria-hidden>
            /
          </span>
        </li>
      ))}
    </ul>
  );
}

export function HousesMarquee({ brands }: HousesMarqueeProps) {
  if (brands.length === 0) return null;

  // Repeat so short catalogs still fill the strip and the loop stays seamless.
  const loop =
    brands.length >= 8
      ? brands
      : Array.from({ length: Math.ceil(8 / brands.length) }, () => brands).flat();

  return (
    <section
      aria-label="Houses in our collection"
      className="relative overflow-hidden border-y border-border/40 py-3.5 sm:py-4"
    >
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-1 w-16 bg-linear-to-r from-background to-transparent sm:w-24"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-1 w-16 bg-linear-to-l from-background to-transparent sm:w-24"
          aria-hidden
        />

        <div className="pointer-events-none flex w-max animate-houses-marquee motion-reduce:animate-none">
          <MarqueeTrack brands={loop} pass={0} />
          <MarqueeTrack brands={loop} pass={1} />
        </div>
      </div>
    </section>
  );
}
