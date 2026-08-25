import { StarRating } from "@/components/store/product/star-rating";
import type { Review } from "@/types";

export function ProductReviews({ reviews }: { reviews: Review[] }) {
  return (
    <section
      id="reviews"
      className="scroll-mt-24 mt-10 border-t border-border/40 pt-8 sm:mt-14 sm:scroll-mt-28 sm:pt-10"
    >
      <p className="text-xs uppercase tracking-[0.3em] text-amber">Reviews</p>
      <h2 className="mt-2 font-display text-2xl sm:text-4xl">
        What wearers say
      </h2>

      {reviews.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground sm:mt-6">
          No reviews yet.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-border/40 border-y sm:mt-7">
          {reviews.map((review) => (
            <li key={review.id} className="py-5 sm:py-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <StarRating rating={review.rating} size="md" />
                {review.title ? (
                  <p className="font-medium">{review.title}</p>
                ) : null}
              </div>
              {review.body ? (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {review.body}
                </p>
              ) : null}
              <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
                <span className="text-muted-foreground">
                  {review.reviewer_name ?? "Verified customer"}
                </span>
                <span className="mx-1.5 text-border">·</span>
                {new Date(review.created_at).toLocaleDateString("en-LK", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
