import { DEMO_PRODUCTS } from "@/lib/catalog/demo";
import { liveOrDemo } from "@/lib/data";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export type AdminOverview = {
  demo: boolean;
  demoProductCount: number;
  productCount: number;
  orderCount: number;
  userCount: number;
  sealedCount: number;
  pendingPaymentCount: number;
  attentionOrderCount: number;
  pendingReviewCount: number;
  todaySales: number;
  monthlyRevenue: number;
  recentOrders: {
    id: string;
    order_number: string;
    status: string;
    total_lkr: number;
    created_at: string;
  }[];
  revenueSeries: { day: string; revenue: number; orders: number }[];
  brandSeries: { brand: string; total: number }[];
  topProducts: [string, number][];
  lowStockCount: number;
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const empty: AdminOverview = {
    demo: true,
    demoProductCount: DEMO_PRODUCTS.length,
    productCount: 0,
    orderCount: 0,
    userCount: 0,
    sealedCount: 0,
    pendingPaymentCount: 0,
    attentionOrderCount: 0,
    pendingReviewCount: 0,
    todaySales: 0,
    monthlyRevenue: 0,
    recentOrders: [],
    revenueSeries: [],
    brandSeries: [],
    topProducts: [],
    lowStockCount: 0,
  };

  return liveOrDemo(
    () => empty,
    async (supabase) => {
      const today = startOfDay().toISOString();
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const since30 = daysAgo(30).toISOString();

      const [
        { count: productCount },
        { count: orderCount },
        { count: userCount },
        { count: sealedCount },
        { count: pendingPaymentCount },
        { count: attentionOrderCount },
        { count: pendingReviewCount },
        { data: paidToday },
        { data: paidMonth },
        { data: recentOrders },
        { data: orders30 },
        { data: orderItems },
        { data: lots },
      ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("inventory_lots")
          .select("*", { count: "exact", head: true })
          .eq("status", "sealed"),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending_payment"),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .in("status", ["pending_payment", "paid", "packing"]),
        supabase
          .from("reviews")
          .select("*", { count: "exact", head: true })
          .eq("is_approved", false),
        supabase
          .from("orders")
          .select("total_lkr")
          .gte("created_at", today)
          .in("status", ["paid", "packing", "shipped", "delivered"]),
        supabase
          .from("orders")
          .select("total_lkr")
          .gte("created_at", monthStart.toISOString())
          .in("status", ["paid", "packing", "shipped", "delivered"]),
        supabase
          .from("orders")
          .select("id, order_number, status, total_lkr, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("orders")
          .select("created_at, total_lkr, status")
          .gte("created_at", since30),
        supabase
          .from("order_items")
          .select("brand_name, line_total_lkr, product_name, quantity"),
        supabase
          .from("inventory_lots")
          .select("product_id, status, remaining_ml, products(name)"),
      ]);

      const todaySales = (paidToday ?? []).reduce(
        (s, o) => s + Number(o.total_lkr),
        0,
      );
      const monthlyRevenue = (paidMonth ?? []).reduce(
        (s, o) => s + Number(o.total_lkr),
        0,
      );

      const byDay = new Map<string, { revenue: number; orders: number }>();
      for (let i = 29; i >= 0; i--) {
        const d = daysAgo(i);
        const key = d.toISOString().slice(5, 10);
        byDay.set(key, { revenue: 0, orders: 0 });
      }
      for (const o of orders30 ?? []) {
        if (!["paid", "packing", "shipped", "delivered"].includes(o.status)) continue;
        const key = String(o.created_at).slice(5, 10);
        const cur = byDay.get(key) ?? { revenue: 0, orders: 0 };
        cur.revenue += Number(o.total_lkr);
        cur.orders += 1;
        byDay.set(key, cur);
      }

      const brandTotals = new Map<string, number>();
      for (const item of orderItems ?? []) {
        brandTotals.set(
          item.brand_name,
          (brandTotals.get(item.brand_name) ?? 0) + Number(item.line_total_lkr),
        );
      }

      const bestSellers = (orderItems ?? []).reduce((map, item) => {
        map.set(item.product_name, (map.get(item.product_name) ?? 0) + Number(item.quantity));
        return map;
      }, new Map<string, number>());

      const lowStock = (lots ?? []).filter((lot) => {
        const rem = Number(lot.remaining_ml);
        return lot.status === "open" && rem > 0 && rem < 10;
      });

      return {
        demo: false,
        demoProductCount: DEMO_PRODUCTS.length,
        productCount: productCount ?? 0,
        orderCount: orderCount ?? 0,
        userCount: userCount ?? 0,
        sealedCount: sealedCount ?? 0,
        pendingPaymentCount: pendingPaymentCount ?? 0,
        attentionOrderCount: attentionOrderCount ?? 0,
        pendingReviewCount: pendingReviewCount ?? 0,
        todaySales,
        monthlyRevenue,
        recentOrders: recentOrders ?? [],
        revenueSeries: [...byDay.entries()].map(([day, v]) => ({
          day,
          revenue: Math.round(v.revenue),
          orders: v.orders,
        })),
        brandSeries: [...brandTotals.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([brand, total]) => ({ brand, total: Math.round(total) })),
        topProducts: [...bestSellers.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5) as [string, number][],
        lowStockCount: lowStock.length,
      };
    },
  );
}
