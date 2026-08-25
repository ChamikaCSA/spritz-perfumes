import { revalidatePath } from "next/cache";

export type ActionResult = { ok: true; error: null } | { ok: false; error: string };

export function ok(): ActionResult {
  return { ok: true, error: null };
}

export function fail(error: string): ActionResult {
  return { ok: false, error };
}

/** Bind an ActionResult mutation to a native `<form action>`. */
export function toFormAction(
  action: (formData: FormData) => Promise<ActionResult>,
) {
  return async (formData: FormData) => {
    const result = await action(formData);
    if (!result.ok) throw new Error(result.error);
  };
}

export function revalidateCatalog() {
  revalidatePath("/admin/products");
  revalidatePath("/admin/brands");
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath("/brands");
}

export function revalidateAccount() {
  revalidatePath("/account");
  revalidatePath("/account/profile");
}

export function revalidateAdminInventory() {
  revalidatePath("/admin/inventory");
}

export function revalidateOrder(id: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/orders/${id}`);
  revalidatePath(`/admin/orders/${id}/invoice`);
}
