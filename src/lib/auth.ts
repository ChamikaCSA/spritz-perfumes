import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/admin";
import { isDemoMode, isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export { isDemoMode };

export async function getSessionUser(): Promise<User | null> {
  if (isDemoMode()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getAccountUser(nextPath: string): Promise<User> {
  if (isDemoMode()) redirect("/account");
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export async function requireUser(): Promise<
  { ok: true; user: User } | { ok: false; error: string }
> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "This feature requires Supabase" };
  }
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Sign in required" };
  return { ok: true, user };
}

export async function requireAdmin() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") throw new Error("Forbidden");
  return { service: createServiceClient(), user, userId: user.id };
}

export async function isAdminUser(userId: string): Promise<boolean> {
  if (isDemoMode()) return false;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return profile?.role === "admin";
}
