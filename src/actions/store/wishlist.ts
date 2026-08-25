"use server";

import { fail, ok, type ActionResult } from "@/actions/_shared";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function syncWishlist(productIds: string[]): Promise<ActionResult> {
  const auth = await requireUser();
  if (!auth.ok) {
    return fail(auth.error === "This feature requires Supabase" ? "Wishlist requires Supabase" : auth.error);
  }

  const supabase = await createClient();
  await supabase.from("wishlist_items").delete().eq("user_id", auth.user.id);
  if (productIds.length) {
    const { error } = await supabase.from("wishlist_items").insert(
      productIds.map((product_id) => ({ user_id: auth.user.id, product_id })),
    );
    if (error) return fail(error.message);
  }
  return ok();
}
