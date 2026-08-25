import { liveOrDemo } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { normalizeProduct, type ProductRow } from "@/lib/catalog/normalize";
import {
  PAGE_SIZE,
  emptyPage,
  pageFromTotal,
  pageRange,
} from "@/lib/pagination";
import { createServiceClient } from "@/lib/supabase/admin";
import type { Product, Review } from "@/types";

export type ReviewPrompt = {
  product: Product;
  existingReview: Review | null;
};

export async function userHasPurchasedProduct(productId: string): Promise<boolean> {
  return liveOrDemo(
    () => false,
    async (supabase) => {
      const user = await getSessionUser();
      if (!user) return false;
      const { data, error } = await supabase.rpc("user_has_purchased_product", {
        p_product_id: productId,
      });
      if (error) {
        console.error("userHasPurchasedProduct failed", error.message);
        return false;
      }
      return Boolean(data);
    },
  );
}

export async function getReviewPromptsForUser(userId: string): Promise<ReviewPrompt[]> {
  return liveOrDemo(
    () => [],
    async () => {
      try {
        const service = createServiceClient();
        const { data: orders, error: ordersError } = await service
          .from("orders")
          .select("id, order_items(variant_id, product_name)")
          .eq("user_id", userId)
          .in("status", ["paid", "packing", "shipped", "delivered"]);

        if (ordersError || !orders?.length) return [];

        const variantIds = new Set<string>();
        const names = new Set<string>();
        for (const order of orders) {
          const items =
            (
              order as {
                order_items?: { variant_id: string | null; product_name: string }[];
              }
            ).order_items ?? [];
          for (const item of items) {
            if (item.variant_id) variantIds.add(item.variant_id);
            if (item.product_name) names.add(item.product_name);
          }
        }

        const productIds = new Set<string>();
        if (variantIds.size > 0) {
          const { data: variants } = await service
            .from("product_variants")
            .select("product_id")
            .in("id", [...variantIds]);
          for (const v of variants ?? []) {
            productIds.add(v.product_id);
          }
        }
        if (names.size > 0) {
          const { data: byName } = await service
            .from("products")
            .select("id")
            .in("name", [...names])
            .eq("is_active", true);
          for (const p of byName ?? []) productIds.add(p.id);
        }
        if (productIds.size === 0) return [];

        const ids = [...productIds];
        const [{ data: products }, { data: reviews }] = await Promise.all([
          service
            .from("products")
            .select(
              "*, brands(*), product_variants(*), product_rating_summary(avg_rating, review_count)",
            )
            .in("id", ids)
            .eq("is_active", true),
          service.from("reviews").select("*").eq("user_id", userId).in("product_id", ids),
        ]);

        const reviewByProduct = new Map(
          (reviews ?? []).map((r) => [(r as Review).product_id, r as Review]),
        );

        const prompts: ReviewPrompt[] = [];
        for (const row of products ?? []) {
          const product = normalizeProduct({
            ...(row as unknown as ProductRow),
            brands: (row as unknown as ProductRow).brands,
            product_variants: (row as unknown as ProductRow).product_variants,
            product_rating_summary: (row as unknown as ProductRow)
              .product_rating_summary,
          });
          prompts.push({
            product,
            existingReview: reviewByProduct.get(product.id) ?? null,
          });
        }

        prompts.sort((a, b) => {
          const rank = (p: ReviewPrompt) => {
            if (!p.existingReview) return 0;
            if (!p.existingReview.is_approved) return 1;
            return 2;
          };
          return rank(a) - rank(b) || a.product.name.localeCompare(b.product.name);
        });
        return prompts;
      } catch (err) {
        console.error("getReviewPromptsForUser failed", err);
        return [];
      }
    },
  );
}

export async function getApprovedReviews(
  productId?: string,
  limit = 20,
): Promise<Review[]> {
  return liveOrDemo(
    () => [],
    async (supabase) => {
      let query = supabase
        .from("reviews")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (productId) query = query.eq("product_id", productId);
      const { data, error } = await query;
      if (error || !data) return [];

      const reviews = data as Review[];
      const userIds = [...new Set(reviews.map((r) => r.user_id))];
      const nameByUser = new Map<string, string>();

      if (userIds.length) {
        try {
          const service = createServiceClient();
          const { data: profiles } = await service
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds);
          for (const profile of profiles ?? []) {
            const name = String(profile.full_name ?? "").trim();
            if (name) nameByUser.set(profile.id, name);
          }
        } catch (err) {
          console.error("getApprovedReviews profile lookup failed", err);
        }
      }

      return reviews.map((review) => ({
        ...review,
        reviewer_name: nameByUser.get(review.user_id) ?? "Verified customer",
      }));
    },
  );
}

export type AdminReviewRow = {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_approved: boolean;
  created_at: string;
  products: { name: string } | { name: string }[] | null;
};

export type AdminReviewProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export async function getAdminReviewsPage(
  page: number,
  pageSize = PAGE_SIZE.admin,
) {
  return liveOrDemo(
    () => ({
      pending: [] as AdminReviewRow[],
      published: emptyPage<AdminReviewRow>(page, pageSize),
      profiles: [] as AdminReviewProfile[],
    }),
    async (supabase) => {
      const { from, to } = pageRange(page, pageSize);
      const [{ data: pendingRows }, { data: publishedRows, count }] =
        await Promise.all([
          supabase
            .from("reviews")
            .select(
              "id, user_id, rating, title, body, is_approved, created_at, products(name)",
            )
            .eq("is_approved", false)
            .order("created_at", { ascending: false })
            .limit(100),
          supabase
            .from("reviews")
            .select(
              "id, user_id, rating, title, body, is_approved, created_at, products(name)",
              { count: "exact" },
            )
            .eq("is_approved", true)
            .order("created_at", { ascending: false })
            .range(from, to),
        ]);
      const pending = (pendingRows ?? []) as unknown as AdminReviewRow[];
      const published = pageFromTotal(
        (publishedRows ?? []) as unknown as AdminReviewRow[],
        count ?? 0,
        page,
        pageSize,
      );
      const userIds = [
        ...new Set([...pending, ...published.items].map((r) => r.user_id)),
      ];
      const { data: profiles } = userIds.length
        ? await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", userIds)
        : { data: [] as AdminReviewProfile[] };
      return {
        pending,
        published,
        profiles: (profiles ?? []) as AdminReviewProfile[],
      };
    },
  );
}
