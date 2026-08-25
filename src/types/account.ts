export type UserRole = "customer" | "admin";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
};

export type Address = {
  id: string;
  user_id: string;
  label: string;
  first_name: string;
  last_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  district: string;
  postal_code: string | null;
  country: string;
  is_default: boolean;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  longevity_score: number | null;
  projection_score: number | null;
  value_score: number | null;
  packaging_score: number | null;
  is_approved: boolean;
  created_at: string;
  /** Display name for storefront; never expose email publicly. */
  reviewer_name?: string | null;
};
