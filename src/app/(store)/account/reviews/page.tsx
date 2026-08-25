import { AccountReviewCard } from "@/components/store/account/account-review-card";
import {
  AccountEmpty,
  AccountPageHeader,
} from "@/components/store/account/account-shell";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { getAccountUser } from "@/lib/auth";
import { PAGE_SIZE, paginate, parsePage } from "@/lib/pagination";
import { getReviewPromptsForUser } from "@/lib/reviews";

export const metadata = { title: "Reviews · Account" };

export default async function AccountReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getAccountUser("/account/reviews");

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
