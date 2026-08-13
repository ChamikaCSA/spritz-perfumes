import { redirect } from "next/navigation";
import { AccountReviewCard } from "@/components/store/account-review-card";
import {
  AccountEmpty,
  AccountPageHeader,
} from "@/components/store/account-shell";
import { PaginationNav } from "@/components/store/pagination-nav";
import { getReviewPromptsForUser } from "@/lib/catalog";
import { PAGE_SIZE, paginate, parsePage } from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils-commerce";

export const metadata = { title: "Reviews · Account" };

export default async function AccountReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if (!isSupabaseConfigured()) redirect("/account");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/reviews");

  const { page: pageParam } = await searchParams;
  const prompts = await getReviewPromptsForUser(user.id);
  const pending = prompts.filter((p) => !p.existingReview);
  const result = paginate(prompts, parsePage(pageParam), PAGE_SIZE.reviews);

  return (
    <div>
      <AccountPageHeader
        title="Reviews"
        description="Notes on fragrances from completed orders."
      />

      {prompts.length === 0 ? (
        <AccountEmpty actionHref="/shop" actionLabel="Shop the catalog">
          No completed purchases to review yet.
        </AccountEmpty>
      ) : (
        <>
          {pending.length > 0 ? (
            <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-amber sm:mb-6 sm:text-xs">
              {pending.length} awaiting your review
            </p>
          ) : null}
          <ul id="results" className="scroll-mt-24 space-y-3 sm:space-y-4">
            {result.items.map(({ product, existingReview }) => (
              <AccountReviewCard
                key={product.id}
                product={product}
                existingReview={existingReview}
              />
            ))}
          </ul>
          <PaginationNav
            page={result.page}
            pageCount={result.pageCount}
            total={result.total}
            pageSize={result.pageSize}
            pathname="/account/reviews"
            compact
          />
        </>
      )}
    </div>
  );
}
