import type { ReactNode } from "react";

export const authFieldClass =
  "h-11 w-full border border-border bg-secondary/40 px-3 text-sm outline-none focus:ring-1 focus:ring-amber";

export const authButtonClass =
  "h-11 w-full bg-amber text-xs uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-50";

export function AuthPageShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-36">
      <h1 className="font-display text-3xl sm:text-5xl">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
      {children}
      {footer}
    </div>
  );
}
