"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/utils-commerce";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      toast.error("Configure Supabase env vars to enable auth");
      return;
    }
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    const confirm = String(form.get("confirm"));
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: String(form.get("email")),
      password,
      options: {
        data: { full_name: String(form.get("full_name") ?? "") },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      "Account created — check your email if confirmation is required",
    );
    router.push("/account");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-36">
      <h1 className="font-display text-3xl sm:text-5xl">Join Spritz</h1>
      <p className="mt-2 text-muted-foreground">
        Track orders and checkout faster next time.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 sm:mt-8">
        <input
          name="full_name"
          required
          placeholder="Full name"
          className="h-11 w-full border border-border bg-secondary/40 px-3 text-sm outline-none focus:ring-1 focus:ring-amber"
        />
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
          minLength={6}
          placeholder="Password"
          className="h-11 w-full border border-border bg-secondary/40 px-3 text-sm outline-none focus:ring-1 focus:ring-amber"
        />
        <input
          name="confirm"
          type="password"
          required
          placeholder="Confirm password"
          className="h-11 w-full border border-border bg-secondary/40 px-3 text-sm outline-none focus:ring-1 focus:ring-amber"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full bg-amber text-xs uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-amber hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
