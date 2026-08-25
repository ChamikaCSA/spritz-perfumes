import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/types";

export function BrandCard({
  brand,
  layout = "tile",
}: {
  brand: Brand;
  layout?: "tile" | "row";
}) {
  if (layout === "row") {
    return (
      <Link
        href={`/brands/${brand.slug}`}
        className="group flex items-center gap-4 py-3 transition sm:gap-5 sm:py-4"
      >
        <div className="relative h-16 w-28 shrink-0 overflow-hidden bg-secondary/40 sm:h-20 sm:w-36">
          {brand.banner_url ? (
            <Image
              src={brand.banner_url}
              alt=""
              fill
              sizes="144px"
              className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
            />
          ) : brand.logo_url ? (
            <div className="flex h-full items-center justify-center bg-[#f3ebe0] p-2">
              <Image
                src={brand.logo_url}
                alt=""
                width={80}
                height={80}
                className="h-8 w-auto object-contain opacity-90 sm:h-10"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-display text-xl text-muted-foreground/50">
                {brand.name.slice(0, 1)}
              </span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-lg group-hover:text-amber sm:text-xl">
            {brand.name}
          </h2>
          {brand.country ? (
            <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:text-xs">
              {brand.country}
            </p>
          ) : null}
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/brands/${brand.slug}`} className="group block transition">
      <div className="relative aspect-16/10 overflow-hidden bg-secondary/40">
        {brand.banner_url ? (
          <Image
            src={brand.banner_url}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
          />
        ) : brand.logo_url ? (
          <div className="flex h-full items-center justify-center bg-[#f3ebe0] p-4 sm:p-8">
            <Image
              src={brand.logo_url}
              alt=""
              width={160}
              height={160}
              className="h-12 w-auto object-contain opacity-90 transition group-hover:opacity-100 sm:h-16"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-2xl text-muted-foreground/50 group-hover:text-amber sm:text-3xl">
              {brand.name.slice(0, 1)}
            </span>
          </div>
        )}
      </div>
      <div className="px-2.5 pb-3 pt-2 sm:px-3 sm:pb-4 sm:pt-2.5">
        <h2 className="truncate font-display text-base group-hover:text-amber sm:text-lg">
          {brand.name}
        </h2>
        {brand.country ? (
          <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:mt-1 sm:text-xs">
            {brand.country}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
