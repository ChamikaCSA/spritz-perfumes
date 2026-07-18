import { redirect } from "next/navigation";
import { AccountReviewCard } from "@/components/store/account-review-card";
import {
  AccountEmpty,
  AccountPageHeader,
} from "@/components/store/account-shell";
import { getReviewPromptsForUser } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils-commerce";

export const metadata = { title: "Reviews · Account" };

export default async function AccountReviewsPage() {
  if (!isSupabaseConfigured()) redirect("/account");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/reviews");

  const prompts = await getReviewPromptsForUser(user.id);
  const pending = prompts.filter((p) => !p.existingReview);

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
          <ul className="space-y-3 sm:space-y-4">
            {prompts.map(({ product, existingReview }) => (
              <AccountReviewCard
                key={product.id}
                product={product}
                existingReview={existingReview}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
