import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow = "Admin",
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex min-w-0 flex-col gap-3 sm:mb-7 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.3em] text-amber sm:text-xs">
          {eyebrow}
        </p>
        <h1 className="mt-1 break-words font-display text-2xl leading-tight sm:mt-2 sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground sm:mt-3 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">{actions}</div>
      ) : null}
    </div>
  );
}

export function AdminPanel({
  children,
  className,
  title,
  description,
  action,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "min-w-0 border border-border/60 bg-secondary/20 p-4 sm:p-6",
        className,
      )}
    >
      {title ? (
        <div className="mb-4 flex min-w-0 flex-wrap items-end justify-between gap-2 sm:mb-5 sm:gap-3">
          <div className="min-w-0">
            <h2 className="break-words font-display text-xl sm:text-2xl lg:text-3xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export function AdminEmpty({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground sm:px-6 sm:py-12 sm:text-base">
      {children}
    </div>
  );
}

export function AdminStat({
  label,
  value,
  href,
  tone = "default",
}: {
  label: string;
  value: string;
  href?: string;
  tone?: "default" | "amber";
}) {
  const inner = (
    <>
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px] sm:tracking-[0.18em]">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 break-words font-display text-xl tabular-nums leading-none sm:mt-3 sm:text-3xl",
          tone === "amber" ? "text-amber" : "text-foreground",
        )}
      >
        {value}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="border border-border/60 bg-secondary/20 p-3 transition hover:border-amber/40 sm:p-5"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="border border-border/60 bg-secondary/20 p-3 sm:p-5">
      {inner}
    </div>
  );
}

export const adminFieldClass =
  "h-11 w-full border border-border bg-secondary/40 px-3 text-base outline-none transition placeholder:text-muted-foreground/70 focus:ring-1 focus:ring-amber/40 sm:text-sm";

export const adminTextareaClass =
  "min-h-24 w-full border border-border bg-secondary/40 px-3 py-2.5 text-base outline-none transition placeholder:text-muted-foreground/70 focus:ring-1 focus:ring-amber/40 sm:text-sm";

export const adminButtonClass =
  "inline-flex h-11 flex-1 items-center justify-center bg-amber px-5 text-xs uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-amber-soft disabled:opacity-50 sm:flex-none sm:px-6";

export const adminGhostButtonClass =
  "inline-flex h-11 items-center justify-center border border-border px-3 text-xs uppercase tracking-[0.14em] text-muted-foreground transition hover:border-amber/50 hover:text-amber sm:px-4";

/** Compact bordered control for row actions (View, Edit, Update, …). */
export const adminRowActionClass =
  "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center border border-border bg-secondary/40 px-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-foreground transition hover:border-amber/50 hover:bg-secondary/70 hover:text-amber focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber/40 disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:px-3 sm:text-[11px]";

/** Emphasized row action — primary or destructive-adjacent actions in lists. */
export const adminRowActionPrimaryClass =
  "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center border border-amber/40 bg-amber/10 px-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-amber transition hover:border-amber/70 hover:bg-amber/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber/40 disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:px-3 sm:text-[11px]";

/** Text link inside panels and dialogs (not for table row actions). */
export const adminTextLinkClass =
  "inline-flex min-h-9 cursor-pointer items-center text-xs uppercase tracking-[0.14em] text-amber underline decoration-amber/40 underline-offset-4 transition hover:decoration-amber sm:text-[11px]";

export function AdminActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-end gap-1",
        className,
      )}
    >
      {children}
    </div>
  );
}
