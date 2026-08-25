import { demoStockForProduct } from "@/lib/catalog/demo";
import { liveOrDemo } from "@/lib/data";
import {
  PAGE_SIZE,
  emptyPage,
  pageFromTotal,
  pageRange,
} from "@/lib/pagination";
import type { StockSummary } from "@/types";

export async function getStockSummary(productId: string): Promise<StockSummary> {
  return liveOrDemo(
    () => demoStockForProduct(productId),
    async (supabase) => {
      const { data, error } = await supabase.rpc("product_stock_summary", {
        p_product_id: productId,
      });

      if (error || !data) {
        console.error("getStockSummary failed", error?.message);
        return { sealedBottles: 0, openMl: 0 };
      }

      const summary = data as { sealedBottles?: number; openMl?: number };
      return {
        sealedBottles: Number(summary.sealedBottles ?? 0),
        openMl: Number(summary.openMl ?? 0),
      };
    },
  );
}

export type AdminInventoryProductOption = {
  id: string;
  name: string;
  brands: { name: string } | { name: string }[] | null;
};

export type AdminLotRow = {
  id: string;
  status: string;
  fill_ml: number;
  remaining_ml: number;
  products: {
    name: string;
    brands: { name: string } | { name: string }[];
  } | null;
};

export type AdminEventRow = {
  id: string;
  kind: string;
  delta_ml: number;
  note: string | null;
  created_at: string;
  products: { name: string } | null;
};

export async function getAdminInventoryPage(lotsPage: number, eventsPage: number) {
  const lotsSize = PAGE_SIZE.admin;
  const eventsSize = PAGE_SIZE.inventoryEvents;
  return liveOrDemo(
    () => ({
      products: [] as AdminInventoryProductOption[],
      lots: emptyPage<AdminLotRow>(lotsPage, lotsSize),
      events: emptyPage<AdminEventRow>(eventsPage, eventsSize),
    }),
    async (supabase) => {
      const lotsRange = pageRange(lotsPage, lotsSize);
      const eventsRange = pageRange(eventsPage, eventsSize);
      const [
        { data: products },
        { data: lots, count: lotsCount },
        { data: events, count: eventsCount },
      ] = await Promise.all([
        supabase.from("products").select("id, name, brands(name)").order("name"),
        supabase
          .from("inventory_lots")
          .select("*, products(name, brands(name))", { count: "exact" })
          .order("received_at", { ascending: false })
          .range(lotsRange.from, lotsRange.to),
        supabase
          .from("inventory_events")
          .select("*, products(name)", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(eventsRange.from, eventsRange.to),
      ]);
      return {
        products: (products ?? []) as AdminInventoryProductOption[],
        lots: pageFromTotal(
          (lots ?? []) as unknown as AdminLotRow[],
          lotsCount ?? 0,
          lotsPage,
          lotsSize,
        ),
        events: pageFromTotal(
          (events ?? []) as unknown as AdminEventRow[],
          eventsCount ?? 0,
          eventsPage,
          eventsSize,
        ),
      };
    },
  );
}
