"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AuthPageShell,
  authButtonClass,
  authFieldClass,
} from "@/components/store/auth/auth-page-shell";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/supabase/env";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isDemoMode()) {
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
    <AuthPageShell
      title="Join Spritz"
      description="Track orders and checkout faster next time."
      footer={
        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-amber hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="mt-6 space-y-4 sm:mt-8">
        <input
          name="full_name"
          required
          placeholder="Full name"
          className={authFieldClass}
        />
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
          minLength={6}
          placeholder="Password"
          className={authFieldClass}
        />
        <input
          name="confirm"
          type="password"
          required
          placeholder="Confirm password"
          className={authFieldClass}
        />
        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
    </AuthPageShell>
  );
}
