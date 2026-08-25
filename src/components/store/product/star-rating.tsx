import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  max = 5,
  size = "sm",
  className,
}: {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const value = Math.max(0, Math.min(max, Number(rating) || 0));
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.4 && value - full < 0.9;
  const textSize = size === "md" ? "text-base" : "text-xs";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-amber",
        textSize,
        className,
      )}
      aria-label={`${value.toFixed(1)} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = i < full || (i === full && hasHalf);
        return (
          <span
            key={i}
            className={cn(
              filled ? "text-amber" : "text-muted-foreground/40",
            )}
            aria-hidden
          >
            ★
          </span>
        );
      })}
    </span>
  );
}
