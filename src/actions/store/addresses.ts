"use server";

import { revalidateAccount } from "@/actions/_shared";
import { parseAddressForm } from "@/lib/account/schema";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function createAddress(formData: FormData): Promise<void> {
  const auth = await requireUser();
  if (!auth.ok) {
    throw new Error(
      auth.error === "This feature requires Supabase"
        ? "Addresses require Supabase"
        : auth.error,
    );
  }
  const parsed = parseAddressForm(formData);
  if (!parsed.success) throw new Error("Fill in required address fields");

  const supabase = await createClient();
  const { error } = await supabase.from("addresses").insert({
    user_id: auth.user.id,
    label: parsed.data.label,
    first_name: parsed.data.first_name,
    last_name: parsed.data.last_name,
    phone: parsed.data.phone,
    address_line1: parsed.data.address_line1,
    address_line2: parsed.data.address_line2,
    city: parsed.data.city,
    district: parsed.data.district,
    postal_code: parsed.data.postal_code,
    country: parsed.data.country,
    is_default: parsed.data.is_default,
  });
  if (error) throw new Error(error.message);
  revalidateAccount();
}

export async function updateAddress(formData: FormData): Promise<void> {
  const auth = await requireUser();
  if (!auth.ok) {
    throw new Error(
      auth.error === "This feature requires Supabase"
        ? "Addresses require Supabase"
        : auth.error,
    );
  }
  const parsed = parseAddressForm(formData);
  if (!parsed.success || !parsed.data.id) throw new Error("Missing address id");

  const supabase = await createClient();
  const { error } = await supabase
    .from("addresses")
    .update({
      label: parsed.data.label,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      phone: parsed.data.phone,
      address_line1: parsed.data.address_line1,
      address_line2: parsed.data.address_line2,
      city: parsed.data.city,
      district: parsed.data.district,
      postal_code: parsed.data.postal_code,
      country: parsed.data.country,
      is_default: parsed.data.is_default,
    })
    .eq("id", parsed.data.id)
    .eq("user_id", auth.user.id);

  if (error) throw new Error(error.message);
  revalidateAccount();
}

export async function deleteAddress(formData: FormData): Promise<void> {
  const auth = await requireUser();
  if (!auth.ok) {
    throw new Error(
      auth.error === "This feature requires Supabase"
        ? "Addresses require Supabase"
        : auth.error,
    );
  }
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing address id");

  const supabase = await createClient();
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user.id);
  if (error) throw new Error(error.message);
  revalidateAccount();
}
