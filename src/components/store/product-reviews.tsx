import { StarRating } from "@/components/store/star-rating";
import type { Review } from "@/lib/types";

export function ProductReviews({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="mt-10 border-t border-border pt-8 sm:mt-14 sm:pt-10">
      <p className="text-xs uppercase tracking-[0.3em] text-amber">Reviews</p>
      <h2 className="mt-2 font-display text-2xl sm:text-4xl">
        What wearers say
      </h2>

      <ul className="mt-5 space-y-5 sm:mt-7 sm:space-y-6">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="border-b border-border/50 pb-5 last:border-0 sm:pb-6"
          >
            <div className="flex items-center gap-3">
              <StarRating rating={review.rating} size="md" />
              {review.title ? (
                <p className="font-medium">{review.title}</p>
              ) : null}
            </div>
            {review.body ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {review.body}
              </p>
            ) : null}
            <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
              {new Date(review.created_at).toLocaleDateString("en-LK", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
