"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitReview } from "@/actions/store";
import type { Product, Review } from "@/types";

export function AccountReviewCard({
  product,
  existingReview,
}: {
  product: Product;
  existingReview: Review | null;
}) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(existingReview?.rating ?? 5);

  const statusLabel = !existingReview
    ? null
    : existingReview.is_approved
      ? "Published"
      : "Submitted";

  const meta = (
    <>
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:text-xs">
        {product.brand?.name}
      </p>
      {open ? (
        <Link
          href={`/product/${product.slug}`}
          className="mt-0.5 block wrap-break-word font-display text-xl hover:text-amber sm:mt-1 sm:text-2xl"
        >
          {product.name}
        </Link>
      ) : (
        <p className="mt-0.5 wrap-break-word font-display text-xl sm:mt-1 sm:text-2xl">
          {product.name}
        </p>
      )}
      {statusLabel ? (
        <p className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-amber sm:mt-2">
          {statusLabel}
        </p>
      ) : (
        <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2">
          Share how it wears.
        </p>
      )}
    </>
  );

  return (
    <li className="min-w-0 border border-border/60 bg-secondary/20">
      {open ? (
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">{meta}</div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 pt-0.5 text-[11px] uppercase tracking-[0.14em] text-amber hover:underline sm:text-xs sm:tracking-[0.16em]"
            >
              Hide
            </button>
          </div>
          <form
            className="mt-4 space-y-3 border-t border-border/50 pt-4 sm:mt-5 sm:pt-5"
            action={(fd) => {
              startTransition(async () => {
                const result = await submitReview(fd);
                if (result.ok) {
                  toast.success(
                    existingReview
                      ? "Review updated"
                      : "Thanks — your review was submitted",
                  );
                  setOpen(false);
                } else {
                  toast.error(result.error ?? "Could not submit");
                }
              });
            }}
          >
            <input type="hidden" name="product_id" value={product.id} />
            <input type="hidden" name="rating" value={rating} />
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={
                    n <= rating
                      ? "inline-flex size-11 items-center justify-center text-2xl text-amber"
                      : "inline-flex size-11 items-center justify-center text-2xl text-muted-foreground/40"
                  }
                  aria-label={`${n} stars`}
                >
                  ★
                </button>
              ))}
            </div>
            <input
              name="title"
              defaultValue={existingReview?.title ?? ""}
              placeholder="Title (optional)"
              className="h-11 w-full border border-border bg-secondary/40 px-3 text-base outline-none focus:ring-1 focus:ring-amber/40 sm:text-sm"
            />
            <textarea
              name="body"
              rows={3}
              defaultValue={existingReview?.body ?? ""}
              placeholder="How does it wear?"
              className="w-full border border-border bg-secondary/40 px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-amber/40 sm:text-sm"
            />
            <button
              type="submit"
              disabled={pending}
              className="h-11 w-full bg-amber px-5 text-xs uppercase tracking-[0.16em] text-primary-foreground disabled:opacity-50 sm:h-10 sm:w-auto"
            >
              {pending
                ? "Saving…"
                : existingReview
                  ? "Update review"
                  : "Submit review"}
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-start justify-between gap-3 p-4 text-left transition hover:bg-secondary/40 sm:p-6"
        >
          <div className="min-w-0">{meta}</div>
          <span className="shrink-0 pt-0.5 text-[11px] uppercase tracking-[0.14em] text-amber sm:text-xs sm:tracking-[0.16em]">
            {existingReview ? "Edit" : "Write"}
          </span>
        </button>
      )}
    </li>
  );
}
