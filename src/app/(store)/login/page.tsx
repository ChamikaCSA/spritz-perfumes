"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/utils-commerce";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account";
  const authError = searchParams.get("error");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      toast.error("Configure Supabase env vars to enable auth");
      return;
    }
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-36">
      <h1 className="font-display text-3xl sm:text-5xl">Sign in</h1>
      <p className="mt-2 text-muted-foreground">
        Access your orders and saved details.
      </p>
      {authError ? (
        <p className="mt-4 text-sm text-destructive">
          Sign-in link expired or failed. Please sign in with your password.
        </p>
      ) : null}
      <form onSubmit={onSubmit} className="mt-6 space-y-4 sm:mt-8">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="h-11 w-full border border-border bg-secondary/40 px-3 text-sm outline-none focus:ring-1 focus:ring-amber"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="h-11 w-full border border-border bg-secondary/40 px-3 text-sm outline-none focus:ring-1 focus:ring-amber"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full bg-amber text-xs uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="text-amber hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
