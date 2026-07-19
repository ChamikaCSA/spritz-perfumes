import { HomeBestSellers } from "@/components/store/home-best-sellers";
import { HomeBuyPath } from "@/components/store/home-buy-path";
import { HomeHero } from "@/components/store/home-hero";
import {
  HomeBrandGrid,
  HomeNewsletter,
  HomeProductRail,
} from "@/components/store/home-sections";
import { HousesMarquee } from "@/components/store/houses-marquee";
import {
  getBestSellers,
  getBrands,
  getProducts,
} from "@/lib/catalog";

export default async function HomePage() {
  const [brands, newest, bestSellers] = await Promise.all([
    getBrands(),
    getProducts({ sort: "newest" }),
    getBestSellers(5),
  ]);

  const arrivalList = newest.slice(0, 4);

  return (
    <>
      <HomeHero />
      <HousesMarquee brands={brands} />
      <HomeBuyPath />

      <HomeBestSellers products={bestSellers} />

      <HomeBrandGrid brands={brands} />

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
