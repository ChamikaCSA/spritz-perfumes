import { cn } from "@/lib/utils";

export function AdminStatus({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "amber" | "muted" | "ok" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex text-[10px] uppercase tracking-[0.16em]",
        tone === "amber" && "text-amber",
        tone === "muted" && "text-muted-foreground",
        tone === "ok" && "text-amber-soft",
        tone === "danger" && "text-destructive",
      )}
    >
      {children}
    </span>
  );
}

export function orderStatusTone(
  status: string,
): "amber" | "muted" | "ok" | "danger" {
  if (status === "delivered") return "ok";
  if (status === "cancelled" || status === "refunded") return "danger";
  if (status === "pending_payment") return "muted";
  return "amber";
}

export function lotStatusTone(
  status: string,
): "amber" | "muted" | "ok" | "danger" {
  if (status === "sealed") return "ok";
  if (status === "open") return "amber";
  return "muted";
}
