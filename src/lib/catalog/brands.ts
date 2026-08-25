import { liveOrDemo } from "@/lib/data";
import {
  PAGE_SIZE,
  emptyPage,
  pageFromTotal,
  pageRange,
  paginate,
  type PageResult,
} from "@/lib/pagination";
import type { Brand } from "@/types";
import { DEMO_BRANDS } from "./demo";

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  return liveOrDemo(
    () => DEMO_BRANDS.find((b) => b.slug === slug) ?? null,
    async (supabase) => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error || !data) return null;
      return data as Brand;
    },
  );
}

export async function getBrands(options?: { limit?: number }): Promise<Brand[]> {
  return liveOrDemo(
    () => (options?.limit ? DEMO_BRANDS.slice(0, options.limit) : DEMO_BRANDS),
    async (supabase) => {
      let query = supabase.from("brands").select("*").order("name");
      if (options?.limit) query = query.limit(options.limit);
      const { data, error } = await query;
      if (error) {
        console.error("getBrands failed", error.message);
        return [];
      }
      return (data as Brand[]) ?? [];
    },
  );
}

export async function getBrandPage(
  page = 1,
  pageSize: number = PAGE_SIZE.brands,
): Promise<PageResult<Brand>> {
  return liveOrDemo(
    () => paginate(DEMO_BRANDS, page, pageSize),
    async (supabase) => {
      const { from, to } = pageRange(page, pageSize);
      const { data, error, count } = await supabase
        .from("brands")
        .select("*", { count: "exact" })
        .order("name")
        .range(from, to);
      if (error) {
        console.error("getBrandPage failed", error.message);
        return emptyPage<Brand>(page, pageSize);
      }
      return pageFromTotal((data as Brand[]) ?? [], count ?? 0, page, pageSize);
    },
  );
}
