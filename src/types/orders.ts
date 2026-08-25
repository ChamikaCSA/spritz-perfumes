import type { VariantType } from "./catalog";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "packing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded";

export type PaymentStatus = "pending" | "success" | "failed" | "chargedback";
export type ReturnStatus = "pending" | "approved" | "rejected" | "refunded";

export type OrderItem = {
  id: string;
  order_id: string;
  variant_id: string | null;
  product_name: string;
  brand_name: string;
  variant_type: VariantType;
  size_ml: number;
  sku: string;
  quantity: number;
  unit_price_lkr: number;
  line_total_lkr: number;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  district: string;
  postal_code: string | null;
  country: string;
  status: OrderStatus;
  subtotal_lkr: number;
  shipping_lkr: number;
  total_lkr: number;
  notes: string | null;
  tracking_number?: string | null;
  shipped_at?: string | null;
  created_at: string;
  items?: OrderItem[];
};

export type ReturnRequest = {
  id: string;
  order_id: string;
  user_id: string;
  reason: string;
  status: ReturnStatus;
  admin_note: string | null;
  created_at: string;
};

export type CartItem = {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  brandName: string;
  variantType: VariantType;
  sizeMl: number;
  unitPriceLkr: number;
  sku: string;
  quantity: number;
  image?: string;
};
