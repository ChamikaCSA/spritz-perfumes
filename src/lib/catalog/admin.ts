import { DEMO_BRANDS, DEMO_PRODUCTS } from "@/lib/catalog/demo";
import { liveOrDemo } from "@/lib/data";
import {
  PAGE_SIZE,
  emptyPage,
  pageFromTotal,
  pageRange,
  paginate,
  type PageResult,
} from "@/lib/pagination";
import type { Product } from "@/types";

export type AdminBrandOption = { id: string; name: string };

export type AdminProductRow = Product & {
  brands: { name: string } | null;
  product_variants: {
    id: string;
    type: string;
    size_ml: number;
    price_lkr: number;
    compare_at_price_lkr: number | null;
    is_active: boolean;
  }[];
};

function demoAdminProducts(): AdminProductRow[] {
  return DEMO_PRODUCTS.map((p) => ({
    ...p,
    brands: p.brand ? { name: p.brand.name } : null,
    product_variants: (p.variants ?? []).map((v) => ({
      id: v.id,
      type: v.type,
      size_ml: v.size_ml,
      price_lkr: v.price_lkr,
      compare_at_price_lkr: v.compare_at_price_lkr ?? null,
      is_active: v.is_active,
    })),
  }));
}

export async function getAdminProductsPage(
  page: number,
  pageSize = PAGE_SIZE.admin,
): Promise<{ result: PageResult<AdminProductRow>; brandOptions: AdminBrandOption[] }> {
  return liveOrDemo(
    () => ({
      result: paginate(demoAdminProducts(), page, pageSize),
      brandOptions: DEMO_BRANDS.map((b) => ({ id: b.id, name: b.name })),
    }),
    async (supabase) => {
      const { from, to } = pageRange(page, pageSize);
      const [{ data: brands }, { data: products, count, error }] = await Promise.all([
        supabase.from("brands").select("id, name").order("name"),
        supabase
          .from("products")
          .select("*, brands(name), product_variants(*)", { count: "exact" })
          .order("name")
          .range(from, to),
      ]);
      if (error) {
        console.error("getAdminProductsPage failed", error.message);
        return {
          result: emptyPage<AdminProductRow>(page, pageSize),
          brandOptions: [],
        };
      }
      return {
        result: pageFromTotal(
          (products ?? []) as unknown as AdminProductRow[],
          count ?? 0,
          page,
          pageSize,
        ),
        brandOptions: (brands ?? []).map((brand) => ({
          id: brand.id,
          name: brand.name,
        })),
      };
    },
  );
}
