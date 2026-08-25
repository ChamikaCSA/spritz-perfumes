"use server";

import { fail, ok, revalidateAccount, type ActionResult } from "@/actions/_shared";
import { profileFormSchema } from "@/lib/account/schema";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const auth = await requireUser();
  if (!auth.ok) {
    return fail(auth.error === "This feature requires Supabase" ? "Profile requires Supabase" : auth.error);
  }
  const parsed = profileFormSchema.safeParse({
    full_name: String(formData.get("full_name") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
  });
  if (!parsed.success) return fail("Check your profile details");

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", auth.user.id);
  if (error) return fail(error.message);
  revalidateAccount();
  return ok();
}
