"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/lib/wishlist-store";
import { cn } from "@/lib/utils";

export function WishlistToggle({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const { has, toggle, hasHydrated } = useWishlist();
  const active = hasHydrated && has(productId);

  return (
    <button
      type="button"
      onClick={() => {
        toggle(productId);
        toast.success(active ? "Removed from wishlist" : "Saved to wishlist");
      }}
      className={cn(
        "inline-flex h-11 items-center gap-2 border border-border px-4 text-xs uppercase tracking-[0.18em] transition hover:border-amber hover:text-amber",
        active && "border-amber text-amber",
        className,
      )}
      aria-pressed={active}
    >
      <Heart
        className={cn("size-4", active && "fill-amber text-amber")}
      />
      {active ? "Wishlisted" : "Wishlist"}
    </button>
  );
}
