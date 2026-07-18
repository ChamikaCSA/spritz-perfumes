import { approveReview } from "@/actions/admin";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/admin-shell";
import { AdminStatus } from "@/components/admin/admin-status";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils-commerce";

export const metadata = { title: "Reviews · Admin" };

type ReviewRow = {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_approved: boolean;
  created_at: string;
  products: { name: string } | { name: string }[] | null;
};

function productName(review: ReviewRow) {
  const p = review.products;
  if (!p) return "Product";
  return Array.isArray(p) ? p[0]?.name ?? "Product" : p.name;
}

function excerpt(text: string | null, max = 120) {
  if (!text) return "—";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default async function AdminReviewsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div>
        <AdminPageHeader
          title="Reviews"
          description="Connect Supabase to moderate product reviews."
        />
      </div>
    );
  }

  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      "id, user_id, rating, title, body, is_approved, created_at, products(name)",
    )
    .order("created_at", { ascending: false });

  const rows = (reviews ?? []) as unknown as ReviewRow[];
  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] };

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p] as const),
  );

  const pending = rows.filter((r) => !r.is_approved);
  const published = rows.filter((r) => r.is_approved);

  return (
    <div className="space-y-5 sm:space-y-8">
      <AdminPageHeader
        title="Reviews"
        description="Approve or unpublish customer reviews."
      />

      <AdminPanel title="Pending">
        {pending.length ? (
          <ReviewList reviews={pending} profileMap={profileMap} />
        ) : (
          <AdminEmpty>No pending reviews</AdminEmpty>
        )}
      </AdminPanel>

      <AdminPanel title="Published">
        {published.length ? (
          <ReviewList reviews={published} profileMap={profileMap} />
        ) : (
          <AdminEmpty>No published reviews</AdminEmpty>
        )}
      </AdminPanel>
    </div>
  );
}

function ReviewList({
  reviews,
  profileMap,
}: {
  reviews: ReviewRow[];
  profileMap: Map<
    string,
    { id: string; full_name: string | null; email: string | null }
  >;
}) {
  return (
    <ul className="divide-y divide-border/50">
      {reviews.map((review) => {
        const profile = profileMap.get(review.user_id);
        const author = profile?.full_name || profile?.email || "Customer";
        return (
          <li
            key={review.id}
            className="flex items-center gap-2 px-0 py-2 sm:gap-3 sm:py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {productName(review)}
                <span className="mx-1.5 font-normal text-border">·</span>
                <span className="font-normal text-amber">
                  {review.rating}/5
                </span>
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                <AdminStatus tone={review.is_approved ? "ok" : "amber"}>
                  {review.is_approved ? "Published" : "Pending"}
                </AdminStatus>
                <span className="truncate">
                  {review.title || excerpt(review.body, 60)}
                </span>
                <span className="tabular-nums">
                  {author} · {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <form action={approveReview} className="shrink-0">
              <input type="hidden" name="id" value={review.id} />
              {review.is_approved ? (
                <button
                  type="submit"
                  className="inline-flex min-h-9 items-center px-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:text-amber"
                >
                  Unpublish
                </button>
              ) : (
                <>
                  <input type="hidden" name="approved" value="on" />
                  <button
                    type="submit"
                    className="inline-flex min-h-9 items-center px-1.5 text-[11px] uppercase tracking-[0.14em] text-amber transition hover:text-amber-soft"
                  >
                    Approve
                  </button>
                </>
              )}
            </form>
          </li>
        );
      })}
    </ul>
  );
}
