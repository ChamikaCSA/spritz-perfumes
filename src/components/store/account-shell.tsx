import Link from "next/link";
import { cn } from "@/lib/utils";

export function AccountPageHeader({
  eyebrow = "Account",
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
    <div className="mb-5 flex min-w-0 flex-wrap items-end justify-between gap-3 sm:mb-8 sm:gap-4">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.3em] text-amber sm:text-xs">
          {eyebrow}
        </p>
        <h1 className="mt-1 break-words font-display text-2xl leading-tight sm:mt-2 sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-lg text-sm text-muted-foreground sm:mt-3 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export function AccountPanel({
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

export function AccountEmpty({
  children,
  actionHref,
  actionLabel,
}: {
  children: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="border border-dashed border-border/70 px-4 py-8 text-center sm:px-6 sm:py-12">
      <p className="text-sm text-muted-foreground sm:text-base">{children}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex h-11 items-center bg-amber px-5 text-xs uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-amber-soft sm:mt-5"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function AccountStatus({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "amber" | "muted" | "ok";
}) {
  return (
    <span
      className={cn(
        "inline-flex text-[10px] uppercase tracking-[0.16em]",
        tone === "amber" && "text-amber",
        tone === "muted" && "text-muted-foreground",
        tone === "ok" && "text-amber-soft",
      )}
    >
      {children}
    </span>
  );
}

export const accountFieldClass =
  "h-11 w-full border border-border bg-secondary/40 px-3 text-base outline-none transition placeholder:text-muted-foreground/70 focus:ring-1 focus:ring-amber/40 sm:text-sm";

export const accountTextareaClass =
  "min-h-24 w-full border border-border bg-secondary/40 px-3 py-2.5 text-base outline-none transition placeholder:text-muted-foreground/70 focus:ring-1 focus:ring-amber/40 sm:text-sm";

export const accountButtonClass =
  "inline-flex h-11 flex-1 items-center justify-center bg-amber px-6 text-xs uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-amber-soft disabled:opacity-50 sm:flex-none";

export const accountGhostButtonClass =
  "inline-flex h-11 items-center justify-center border border-border px-3 text-xs uppercase tracking-[0.14em] text-muted-foreground transition hover:border-amber/50 hover:text-amber";
