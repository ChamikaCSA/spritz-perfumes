import { liveOrDemo } from "@/lib/data";
import { DEMO_BRANDS, DEMO_PRODUCTS } from "./demo";

export type SitemapEntry = {
  slug: string;
  updatedAt?: string;
};

export async function getProductSitemapEntries(): Promise<SitemapEntry[]> {
  return liveOrDemo(
    () => DEMO_PRODUCTS.map((p) => ({ slug: p.slug })),
    async (supabase) => {
      const { data, error } = await supabase
        .from("products")
        .select("slug, updated_at")
        .eq("is_active", true);
      if (error || !data) return [];
      return data.map((row) => ({
        slug: row.slug as string,
        updatedAt: row.updated_at as string | undefined,
      }));
    },
  );
}

export async function getBrandSitemapEntries(): Promise<SitemapEntry[]> {
  return liveOrDemo(
    () => DEMO_BRANDS.map((b) => ({ slug: b.slug })),
    async (supabase) => {
      const { data, error } = await supabase
        .from("brands")
        .select("slug, created_at");
      if (error || !data) return [];
      return data.map((row) => ({
        slug: row.slug as string,
        updatedAt: row.created_at as string | undefined,
      }));
    },
  );
}
