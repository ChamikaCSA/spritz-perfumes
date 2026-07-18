"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/actions/store";

export function NewsletterForm() {
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");

  return (
    <form
      className="mt-6 flex w-full max-w-lg flex-col gap-3 sm:mt-8 sm:flex-row sm:items-stretch"
      action={(fd) => {
        startTransition(async () => {
          const result = await subscribeNewsletter(fd);
          if (result.ok) {
            toast.success("You're on the list");
            setEmail("");
          } else {
            toast.error(result.error ?? "Could not subscribe");
          }
        });
      }}
    >
      <input
        type="email"
        name="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        autoComplete="email"
        className="min-h-16 w-full min-w-0 flex-1 border border-border bg-secondary/40 px-4 py-4 text-base leading-normal outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-amber sm:min-h-12 sm:py-0 sm:text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-16 shrink-0 items-center justify-center bg-amber px-8 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-amber-soft disabled:opacity-50 sm:min-h-12"
      >
        {pending ? "…" : "Subscribe"}
      </button>
    </form>
  );
}
