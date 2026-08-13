import { approveReview } from "@/actions/admin";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  adminRowActionClass,
  adminRowActionPrimaryClass,
} from "@/components/admin/admin-shell";
import { AdminStatus } from "@/components/admin/admin-status";
import { PaginationNav } from "@/components/store/pagination-nav";
import { PAGE_SIZE, pageFromTotal, pageRange, parsePage } from "@/lib/pagination";
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

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
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

  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);
  const { from, to } = pageRange(page, PAGE_SIZE.admin);
  const supabase = await createClient();
  const [{ data: pendingRows }, { data: publishedRows, count: publishedCount }] =
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

  const pending = (pendingRows ?? []) as unknown as ReviewRow[];
  const publishedResult = pageFromTotal(
    (publishedRows ?? []) as unknown as ReviewRow[],
    publishedCount ?? 0,
    page,
    PAGE_SIZE.admin,
  );
  const published = publishedResult.items;
  const userIds = [...new Set([...pending, ...published].map((r) => r.user_id))];
  const { data: profiles } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] };

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p] as const),
  );

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
          <ReviewList
            id="results"
            reviews={published}
            profileMap={profileMap}
          />
        ) : (
          <AdminEmpty>No published reviews</AdminEmpty>
        )}
        <PaginationNav
          page={publishedResult.page}
          pageCount={publishedResult.pageCount}
          total={publishedResult.total}
          pageSize={publishedResult.pageSize}
          pathname="/admin/reviews"
          compact
        />
      </AdminPanel>
    </div>
  );
}

function ReviewList({
  id,
  reviews,
  profileMap,
}: {
  id?: string;
  reviews: ReviewRow[];
  profileMap: Map<
    string,
    { id: string; full_name: string | null; email: string | null }
  >;
}) {
  return (
    <ul id={id} className="scroll-mt-20 divide-y divide-border/50">
      {reviews.map((review) => {
        const profile = profileMap.get(review.user_id);
        const author = profile?.full_name || profile?.email || "User";
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
                <button type="submit" className={adminRowActionClass}>
                  Unpublish
                </button>
              ) : (
                <>
                  <input type="hidden" name="approved" value="on" />
                  <button type="submit" className={adminRowActionPrimaryClass}>
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
