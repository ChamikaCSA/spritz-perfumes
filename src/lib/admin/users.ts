import { liveOrDemo } from "@/lib/data";
import { PAGE_SIZE, emptyPage, pageFromTotal, pageRange } from "@/lib/pagination";
import type { Address, Profile } from "@/types";

const PAID_STATUSES = ["paid", "packing", "shipped", "delivered"];

export type AdminUserRow = Profile & {
  orderCount: number;
  lifetimeSpend: number;
};

export async function getAdminUsersPage(page: number, pageSize = PAGE_SIZE.admin) {
  return liveOrDemo(
    () => emptyPage<AdminUserRow>(page, pageSize),
    async (supabase) => {
      const { from, to } = pageRange(page, pageSize);
      const { data: profiles, count } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);
      const items = (profiles ?? []) as Profile[];
      const userIds = items.map((p) => p.id);
      const { data: orders } = userIds.length
        ? await supabase
            .from("orders")
            .select("user_id, total_lkr, status")
            .in("user_id", userIds)
        : { data: [] as { user_id: string | null; total_lkr: number; status: string }[] };

      const spend = new Map<string, { count: number; total: number }>();
      for (const o of orders ?? []) {
        if (!o.user_id || !PAID_STATUSES.includes(o.status)) continue;
        const cur = spend.get(o.user_id) ?? { count: 0, total: 0 };
        cur.count += 1;
        cur.total += Number(o.total_lkr);
        spend.set(o.user_id, cur);
      }

      const rows: AdminUserRow[] = items.map((p) => {
        const stats = spend.get(p.id) ?? { count: 0, total: 0 };
        return { ...p, orderCount: stats.count, lifetimeSpend: stats.total };
      });
      return pageFromTotal(rows, count ?? 0, page, pageSize);
    },
  );
}

export async function getAdminUserDetail(id: string) {
  return liveOrDemo(
    () => null as {
      profile: Profile;
      orders: {
        id: string;
        order_number: string;
        status: string;
        total_lkr: number;
        created_at: string;
      }[];
      addresses: Address[];
    } | null,
    async (supabase) => {
      const [{ data: profile }, { data: orders }, { data: addresses }] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
          supabase
            .from("orders")
            .select("id, order_number, status, total_lkr, created_at")
            .eq("user_id", id)
            .order("created_at", { ascending: false }),
          supabase.from("addresses").select("*").eq("user_id", id),
        ]);
      if (!profile) return null;
      return {
        profile: profile as Profile,
        orders: orders ?? [],
        addresses: (addresses as Address[]) ?? [],
      };
    },
  );
}
