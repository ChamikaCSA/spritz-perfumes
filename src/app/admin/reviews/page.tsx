import { approveReview } from "@/actions/admin";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  adminRowActionClass,
  adminRowActionPrimaryClass,
} from "@/components/admin/layout/admin-shell";
import { AdminStatus } from "@/components/admin/layout/admin-status";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import {
  getAdminReviewsPage,
  type AdminReviewRow,
} from "@/lib/reviews";
import { isDemoMode } from "@/lib/supabase/env";

export const metadata = { title: "Reviews · Admin" };

function productName(review: AdminReviewRow) {
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
  if (isDemoMode()) {
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
  const { pending, published: publishedResult, profiles } =
    await getAdminReviewsPage(page, PAGE_SIZE.admin);
  const published = publishedResult.items;
  const profileMap = new Map(profiles.map((p) => [p.id, p] as const));

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
  reviews: AdminReviewRow[];
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
