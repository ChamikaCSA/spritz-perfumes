import { liveOrDemo } from "@/lib/data";
import {
  PAGE_SIZE,
  emptyPage,
  pageFromTotal,
  pageRange,
  type PageResult,
} from "@/lib/pagination";
import { createServiceClient } from "@/lib/supabase/admin";
import type { Order } from "@/types";

function mapOrderRows(data: { order_items?: Order["items"] }[]): Order[] {
  return data.map((row) => ({
    ...(row as Order),
    items: row.order_items,
  }));
}

export async function getOrderById(id: string): Promise<Order | null> {
  return liveOrDemo(
    () => null,
    async () => {
      try {
        const service = createServiceClient();
        const { data, error } = await service
          .from("orders")
          .select("*, order_items(*)")
          .eq("id", id)
          .maybeSingle();
        if (error || !data) return null;
        return {
          ...(data as Order),
          items: (data as { order_items: Order["items"] }).order_items,
        };
      } catch (err) {
        console.error("getOrderById failed", err);
        return null;
      }
    },
  );
}

export async function countOrdersForUser(userId: string): Promise<number> {
  return liveOrDemo(
    () => 0,
    async (supabase) => {
      const { count, error } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      if (error) {
        console.error("countOrdersForUser failed", error.message);
        return 0;
      }
      return count ?? 0;
    },
  );
}

export async function getOrdersForUser(
  userId: string,
  options?: { limit?: number; includeItems?: boolean },
): Promise<Order[]> {
  return liveOrDemo(
    () => [],
    async (supabase) => {
      const columns = options?.includeItems === false ? "*" : "*, order_items(*)";
      let query = supabase
        .from("orders")
        .select(columns)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (options?.limit) query = query.limit(options.limit);
      const { data, error } = await query;
      if (error || !data) {
        if (error) console.error("getOrdersForUser failed", error.message);
        return [];
      }
      return mapOrderRows(data as { order_items?: Order["items"] }[]);
    },
  );
}

export async function getOrderPageForUser(
  userId: string,
  page = 1,
  pageSize = PAGE_SIZE.account,
): Promise<PageResult<Order>> {
  return liveOrDemo(
    () => emptyPage<Order>(page, pageSize),
    async (supabase) => {
      const { from, to } = pageRange(page, pageSize);
      const { data, error, count } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) {
        console.error("getOrderPageForUser failed", error.message);
        return emptyPage<Order>(page, pageSize);
      }
      return pageFromTotal(
        mapOrderRows((data ?? []) as { order_items?: Order["items"] }[]),
        count ?? 0,
        page,
        pageSize,
      );
    },
  );
}

export async function getReturnableOrdersForUser(userId: string) {
  return liveOrDemo(
    () => [] as { id: string; order_number: string; status: string }[],
    async (supabase) => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status")
        .eq("user_id", userId)
        .in("status", ["paid", "packing", "shipped", "delivered"])
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) {
        console.error("getReturnableOrdersForUser failed", error.message);
        return [];
      }
      return data ?? [];
    },
  );
}

export type AdminOrderDetail = Order & {
  payments: {
    payhere_payment_id: string | null;
    status: string;
    method: string | null;
  }[];
};

export async function getAdminOrderDetail(id: string): Promise<AdminOrderDetail | null> {
  return liveOrDemo(
    () => null,
    async () => {
      try {
        const service = createServiceClient();
        const { data, error } = await service
          .from("orders")
          .select("*, order_items(*), payments(payhere_payment_id, status, method)")
          .eq("id", id)
          .maybeSingle();
        if (error || !data) return null;
        const row = data as Order & {
          order_items: Order["items"];
          payments: AdminOrderDetail["payments"];
        };
        return {
          ...row,
          items: row.order_items,
          payments: row.payments ?? [],
        };
      } catch (err) {
        console.error("getAdminOrderDetail failed", err);
        return null;
      }
    },
  );
}

export async function getAdminOrdersPage(page: number, pageSize: number) {
  return liveOrDemo(
    () => emptyPage<{
      id: string;
      order_number: string;
      first_name: string;
      last_name: string;
      status: string;
      total_lkr: number;
      created_at: string;
    }>(page, pageSize),
    async (supabase) => {
      const { from, to } = pageRange(page, pageSize);
      const { data, error, count } = await supabase
        .from("orders")
        .select(
          "id, order_number, first_name, last_name, status, total_lkr, created_at",
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) {
        console.error("getAdminOrdersPage failed", error.message);
        return emptyPage(page, pageSize);
      }
      return pageFromTotal(data ?? [], count ?? 0, page, pageSize);
    },
  );
}
