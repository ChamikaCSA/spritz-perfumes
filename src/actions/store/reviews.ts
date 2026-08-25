"use server";

import { revalidatePath } from "next/cache";
import { fail, ok, type ActionResult } from "@/actions/_shared";
import { reviewFormSchema } from "@/lib/account/schema";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function submitReview(formData: FormData): Promise<ActionResult> {
  const auth = await requireUser();
  if (!auth.ok) return fail(auth.error === "This feature requires Supabase" ? "Reviews require Supabase" : auth.error);

  const parsed = reviewFormSchema.safeParse({
    product_id: String(formData.get("product_id") || ""),
    rating: Number(formData.get("rating")),
    title: String(formData.get("title") || "").trim() || null,
    body: String(formData.get("body") || "").trim() || null,
  });
  if (!parsed.success) return fail("Check your review details");

  const supabase = await createClient();
  const { data: purchased, error: purchaseError } = await supabase.rpc(
    "user_has_purchased_product",
    { p_product_id: parsed.data.product_id },
  );
  if (purchaseError) {
    console.error("submitReview purchase check failed", purchaseError.message);
    return fail("Could not verify purchase");
  }
  if (!purchased) {
    return fail("Only customers who completed an order for this fragrance can review it");
  }

  const { error } = await supabase.from("reviews").upsert(
    {
      product_id: parsed.data.product_id,
      user_id: auth.user.id,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      is_approved: false,
    },
    { onConflict: "product_id,user_id" },
  );
  if (error) {
    console.error("submitReview failed", error.message);
    return fail("Could not submit review");
  }

  const { data: product } = await supabase
    .from("products")
    .select("slug")
    .eq("id", parsed.data.product_id)
    .maybeSingle();

  if (product?.slug) revalidatePath(`/product/${product.slug}`);
  revalidatePath("/shop");
  revalidatePath("/account");
  revalidatePath("/account/reviews");
  return ok();
}
