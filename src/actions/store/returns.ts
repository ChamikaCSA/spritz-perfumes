"use server";

import { revalidatePath } from "next/cache";
import { returnFormSchema } from "@/lib/account/schema";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function createReturnRequest(formData: FormData): Promise<void> {
  const auth = await requireUser();
  if (!auth.ok) {
    throw new Error(
      auth.error === "This feature requires Supabase"
        ? "Returns require Supabase"
        : auth.error,
    );
  }
  const parsed = returnFormSchema.safeParse({
    order_id: String(formData.get("order_id") || ""),
    reason: String(formData.get("reason") || "").trim(),
  });
  if (!parsed.success) throw new Error("Order and reason are required");

  const supabase = await createClient();
  const { error } = await supabase.from("return_requests").insert({
    order_id: parsed.data.order_id,
    user_id: auth.user.id,
    reason: parsed.data.reason,
    status: "pending",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/account");
  revalidatePath("/account/returns");
  revalidatePath(`/orders/${parsed.data.order_id}`);
}
