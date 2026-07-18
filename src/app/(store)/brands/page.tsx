import Image from "next/image";
import Link from "next/link";
import { getBrands } from "@/lib/catalog";

export const metadata = { title: "Brands" };

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pt-32">
      <div className="mb-6 sm:mb-10 lg:mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-amber">Houses</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl lg:text-6xl">Brands</h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          Explore the maisons we stock — from heritage classics to contemporary
          niche.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-6">
        {brands.map((brand) => (
          <li key={brand.id}>
            <Link
              href={`/brands/${brand.slug}`}
              className="group block transition"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-secondary/40 sm:aspect-[21/9]">
                {brand.banner_url ? (
                  <Image
                    src={brand.banner_url}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
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
              <div className="mt-2.5 sm:mt-4">
                <h2 className="truncate font-display text-lg group-hover:text-amber sm:text-2xl">
                  {brand.name}
                </h2>
                {brand.country ? (
                  <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:mt-1 sm:text-xs">
                    {brand.country}
                  </p>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
