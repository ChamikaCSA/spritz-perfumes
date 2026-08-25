"use server";

import { fail, ok, type ActionResult } from "@/actions/_shared";
import { isDemoMode } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function subscribeNewsletter(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail("Enter a valid email address");
  }

  if (isDemoMode()) return ok();

  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").upsert(
    { email },
    { onConflict: "email", ignoreDuplicates: true },
  );

  if (error) {
    console.error("subscribeNewsletter failed", error.message);
    return fail("Could not subscribe right now");
  }
  return ok();
}
