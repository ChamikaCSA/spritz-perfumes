import { liveOrDemo } from "@/lib/data";
import type { Address, Profile } from "@/types";

export async function getProfile(userId: string): Promise<Profile | null> {
  return liveOrDemo(
    () => null,
    async (supabase) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      return (data as Profile | null) ?? null;
    },
  );
}

export async function getAddressesForUser(userId: string): Promise<Address[]> {
  return liveOrDemo(
    () => [],
    async (supabase) => {
      const { data } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false });
      return (data as Address[]) ?? [];
    },
  );
}

export async function countAddressesForUser(userId: string): Promise<number> {
  return liveOrDemo(
    () => 0,
    async (supabase) => {
      const { count } = await supabase
        .from("addresses")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      return count ?? 0;
    },
  );
}

export type ReturnRequestRow = {
  id: string;
  reason: string;
  status: string;
  orders: { order_number: string } | { order_number: string }[] | null;
};

export async function getReturnRequestsForUser(
  userId: string,
  page: number,
  pageSize: number,
) {
  return liveOrDemo(
    () => ({ items: [] as ReturnRequestRow[], total: 0, page, pageSize, pageCount: 1 }),
    async (supabase) => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count } = await supabase
        .from("return_requests")
        .select("*, orders(order_number)", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to);
      const total = count ?? 0;
      return {
        items: (data ?? []) as ReturnRequestRow[],
        total,
        page,
        pageSize,
        pageCount: Math.max(1, Math.ceil(total / pageSize) || 1),
      };
    },
  );
}

export async function getCheckoutProfile(userId: string) {
  return liveOrDemo(
    () => ({ addresses: [] as Address[], email: "", phone: "", full_name: "" }),
    async (supabase) => {
      const [{ data: addresses }, { data: profile }] = await Promise.all([
        supabase
          .from("addresses")
          .select("*")
          .eq("user_id", userId)
          .order("is_default", { ascending: false }),
        supabase
          .from("profiles")
          .select("email, full_name, phone")
          .eq("id", userId)
          .maybeSingle(),
      ]);
      return {
        addresses: (addresses as Address[]) ?? [],
        email: profile?.email ?? "",
        full_name: profile?.full_name ?? "",
        phone: profile?.phone ?? "",
      };
    },
  );
}
