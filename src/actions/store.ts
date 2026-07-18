"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type ActionResult = { ok: true; error: null } | { ok: false; error: string };

function ok(): ActionResult {
  return { ok: true, error: null };
}

function fail(error: string): ActionResult {
  return { ok: false, error };
}

function assertOk(result: ActionResult) {
  if (!result.ok) throw new Error(result.error);
}

export async function subscribeNewsletter(formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail("Enter a valid email address");
  }

  if (!isSupabaseConfigured()) {
    return ok();
  }

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

export async function submitReview(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return fail("Reviews require Supabase");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Sign in to leave a review");

  const productId = String(formData.get("product_id") || "");
  const rating = Number(formData.get("rating"));
  const title = String(formData.get("title") || "").trim() || null;
  const body = String(formData.get("body") || "").trim() || null;

  if (!productId) return fail("Missing product");
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return fail("Rating must be 1–5");
  }

  const { data: purchased, error: purchaseError } = await supabase.rpc(
    "user_has_purchased_product",
    { p_product_id: productId },
  );
  if (purchaseError) {
    console.error("submitReview purchase check failed", purchaseError.message);
    return fail("Could not verify purchase");
  }
  if (!purchased) {
    return fail("Only customers who completed an order for this scent can review it");
  }

  const { error } = await supabase.from("reviews").upsert(
    {
      product_id: productId,
      user_id: user.id,
      rating,
      title,
      body,
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
    .eq("id", productId)
    .maybeSingle();

  if (product?.slug) revalidatePath(`/product/${product.slug}`);
  revalidatePath("/shop");
  revalidatePath("/account");
  revalidatePath("/account/reviews");
  return ok();
}

export async function createAddress(formData: FormData) {
  assertOk(await createAddressResult(formData));
}

async function createAddressResult(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail("Addresses require Supabase");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Sign in required");

  const payload = {
    user_id: user.id,
    label: String(formData.get("label") || "Home").trim() || "Home",
    first_name: String(formData.get("first_name") || "").trim(),
    last_name: String(formData.get("last_name") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    address_line1: String(formData.get("address_line1") || "").trim(),
    address_line2: String(formData.get("address_line2") || "").trim() || null,
    city: String(formData.get("city") || "").trim(),
    district: String(formData.get("district") || "").trim(),
    postal_code: String(formData.get("postal_code") || "").trim() || null,
    country: String(formData.get("country") || "Sri Lanka").trim(),
    is_default: formData.get("is_default") === "1",
  };

  if (
    !payload.first_name ||
    !payload.last_name ||
    !payload.phone ||
    !payload.address_line1 ||
    !payload.city ||
    !payload.district
  ) {
    return fail("Fill in required address fields");
  }

  const { error } = await supabase.from("addresses").insert(payload);
  if (error) return fail(error.message);
  revalidatePath("/account");
  revalidatePath("/account/profile");
  return ok();
}

export async function updateAddress(formData: FormData) {
  assertOk(await updateAddressResult(formData));
}

async function updateAddressResult(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail("Addresses require Supabase");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Sign in required");

  const id = String(formData.get("id") || "");
  if (!id) return fail("Missing address id");

  const payload = {
    label: String(formData.get("label") || "Home").trim() || "Home",
    first_name: String(formData.get("first_name") || "").trim(),
    last_name: String(formData.get("last_name") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    address_line1: String(formData.get("address_line1") || "").trim(),
    address_line2: String(formData.get("address_line2") || "").trim() || null,
    city: String(formData.get("city") || "").trim(),
    district: String(formData.get("district") || "").trim(),
    postal_code: String(formData.get("postal_code") || "").trim() || null,
    country: String(formData.get("country") || "Sri Lanka").trim(),
    is_default: formData.get("is_default") === "1",
  };

  const { error } = await supabase
    .from("addresses")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return fail(error.message);
  revalidatePath("/account");
  revalidatePath("/account/profile");
  return ok();
}

export async function deleteAddress(formData: FormData) {
  assertOk(await deleteAddressResult(formData));
}

async function deleteAddressResult(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail("Addresses require Supabase");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Sign in required");

  const id = String(formData.get("id") || "");
  if (!id) return fail("Missing address id");

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return fail(error.message);
  revalidatePath("/account");
  revalidatePath("/account/profile");
  return ok();
}

export async function createReturnRequest(formData: FormData) {
  assertOk(await createReturnRequestResult(formData));
}

async function createReturnRequestResult(
  formData: FormData,
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail("Returns require Supabase");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Sign in required");

  const orderId = String(formData.get("order_id") || "");
  const reason = String(formData.get("reason") || "").trim();
  if (!orderId || !reason) return fail("Order and reason are required");

  const { error } = await supabase.from("return_requests").insert({
    order_id: orderId,
    user_id: user.id,
    reason,
    status: "pending",
  });

  if (error) return fail(error.message);
  revalidatePath("/account");
  revalidatePath("/account/returns");
  revalidatePath(`/orders/${orderId}`);
  return ok();
}

export async function updateProfile(formData: FormData) {
  assertOk(await updateProfileResult(formData));
}

async function updateProfileResult(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail("Profile requires Supabase");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Sign in required");

  const full_name = String(formData.get("full_name") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, phone, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return fail(error.message);
  revalidatePath("/account");
  revalidatePath("/account/profile");
  return ok();
}

export async function syncWishlist(productIds: string[]) {
  if (!isSupabaseConfigured()) return fail("Wishlist requires Supabase");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Sign in required");

  await supabase.from("wishlist_items").delete().eq("user_id", user.id);
  if (productIds.length) {
    const { error } = await supabase.from("wishlist_items").insert(
      productIds.map((product_id) => ({ user_id: user.id, product_id })),
    );
    if (error) return fail(error.message);
  }
  return ok();
}
