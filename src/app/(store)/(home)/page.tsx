import { HomeBestSellers } from "@/components/store/home/home-best-sellers";
import { HomeBuyPath } from "@/components/store/home/home-buy-path";
import { HomeHero } from "@/components/store/home/home-hero";
import {
  HomeBrandGrid,
  HomeNewsletter,
  HomeProductRail,
} from "@/components/store/home/home-sections";
import { HousesMarquee } from "@/components/store/home/houses-marquee";
import {
  getBestSellers,
  getBrands,
  getProducts,
} from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Luxury perfume decants in Sri Lanka",
  description:
    "Shop authentic full bottles and fine decants from Chanel, Dior, Creed, and more. Try before you buy with island-wide delivery across Sri Lanka.",
  path: "/",
});

export default async function HomePage() {
  const [brands, newest, bestSellers] = await Promise.all([
    getBrands({ limit: 48 }),
    getProducts({ sort: "newest", limit: 4 }),
    getBestSellers(5),
  ]);

  const arrivalList = newest;

  return (
    <>
      <HomeHero />
      <HousesMarquee brands={brands} />
      <HomeBuyPath />

      <HomeBestSellers products={bestSellers} />

      <HomeBrandGrid brands={brands.slice(0, 12)} />

      <HomeProductRail
        eyebrow="Just landed"
        title="New arrivals"
        href="/shop?sort=newest"
        linkLabel="Shop new drops"
        products={arrivalList}
      />

      <HomeNewsletter />
    </>
  );
}
