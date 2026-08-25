import { z } from "zod";
import { LK_DISTRICTS } from "@/lib/commerce";

export const addressFieldsSchema = z.object({
  first_name: z.string().trim().min(1),
  last_name: z.string().trim().min(1),
  phone: z.string().trim().min(8),
  address_line1: z.string().trim().min(3),
  address_line2: z.string().trim().optional().nullable(),
  city: z.string().trim().min(1),
  district: z.string().trim().min(1),
  postal_code: z.string().trim().optional().nullable(),
  country: z.string().trim().default("Sri Lanka"),
});

export const addressFormSchema = addressFieldsSchema.extend({
  id: z.string().optional(),
  label: z.string().trim().min(1).default("Home"),
  is_default: z.boolean().default(false),
});

export const profileFormSchema = z.object({
  full_name: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
});

export const reviewFormSchema = z.object({
  product_id: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().optional().nullable(),
  body: z.string().trim().optional().nullable(),
});

export const returnFormSchema = z.object({
  order_id: z.string().min(1),
  reason: z.string().trim().min(1),
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;

export function districtOptions() {
  return LK_DISTRICTS;
}

export function formDataString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export function parseAddressForm(formData: FormData) {
  return addressFormSchema.safeParse({
    id: formDataString(formData, "id") || undefined,
    label: formDataString(formData, "label") || "Home",
    first_name: formDataString(formData, "first_name"),
    last_name: formDataString(formData, "last_name"),
    phone: formDataString(formData, "phone"),
    address_line1: formDataString(formData, "address_line1"),
    address_line2: formDataString(formData, "address_line2") || null,
    city: formDataString(formData, "city"),
    district: formDataString(formData, "district"),
    postal_code: formDataString(formData, "postal_code") || null,
    country: formDataString(formData, "country") || "Sri Lanka",
    is_default: formData.get("is_default") === "1",
  });
}
