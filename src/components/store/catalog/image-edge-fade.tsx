import { cn } from "@/lib/utils";

/** Soft vignette so product photos dissolve into the page background. */
export function ImageEdgeFade({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-1",
        size === "sm" && "image-edge-fade-sm",
        size === "md" && "image-edge-fade",
        size === "lg" && "image-edge-fade-lg",
        className,
      )}
    />
  );
}
