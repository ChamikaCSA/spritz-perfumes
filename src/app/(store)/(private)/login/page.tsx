"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import {
  AuthPageShell,
  authButtonClass,
  authFieldClass,
} from "@/components/store/auth/auth-page-shell";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/supabase/env";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account";
  const authError = searchParams.get("error");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isDemoMode()) {
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
    <AuthPageShell
      title="Sign in"
      description="Access your orders and saved details."
      footer={
        <p className="mt-6 text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="text-amber hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
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
          className={authFieldClass}
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className={authFieldClass}
        />
        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthPageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
