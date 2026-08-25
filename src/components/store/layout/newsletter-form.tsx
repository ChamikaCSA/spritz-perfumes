"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/actions/store";
import { cn } from "@/lib/utils";

export function NewsletterForm({ className }: { className?: string }) {
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");

  return (
    <form
      className={cn(
        "mt-6 flex w-full max-w-lg flex-col gap-3 sm:mt-8 sm:flex-row sm:items-stretch",
        className,
      )}
      action={(fd) => {
        startTransition(async () => {
          const result = await subscribeNewsletter(fd);
          if (result.ok) {
            toast.success("You're in. Watch your inbox.");
            setEmail("");
          } else {
            toast.error(result.error ?? "Could not subscribe");
          }
        });
      }}
    >
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        name="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        autoComplete="email"
        disabled={pending}
        className="min-h-12 w-full min-w-0 flex-1 border border-border bg-secondary/40 px-4 text-base leading-normal outline-none transition placeholder:text-muted-foreground focus:ring-1 focus:ring-amber/50 disabled:opacity-60 sm:text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 shrink-0 items-center justify-center bg-amber px-8 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-amber-soft focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-soft disabled:opacity-50"
      >
        {pending ? "Joining…" : "Join the list"}
      </button>
    </form>
  );
}
