export type UserRole = "customer" | "admin";
export type Concentration = "EDT" | "EDP" | "Parfum" | "Extrait" | "EDC" | "Other";
export type VariantType = "full_size" | "decant";
export type LotStatus = "sealed" | "open" | "depleted";
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
export type ProductCollection = "core" | "gift_set" | "new" | "sale" | "limited";
export type ProductGender = "women" | "men" | "unisex";
export type InventoryEventKind =
  | "receive"
  | "open"
  | "adjust"
  | "loss"
  | "sample"
  | "sale";
export type ReturnStatus = "pending" | "approved" | "rejected" | "refunded";
export type ProductSort =
  | "name"
  | "newest"
  | "price"
  | "popularity"
  | "rating";

export type ProductSortOrder = "asc" | "desc";

export function defaultSortOrder(sort: ProductSort = "name"): ProductSortOrder {
  return sort === "name" || sort === "price" ? "asc" : "desc";
}

export type FragranceNotes = {
  top: string[];
  heart: string[];
  base: string[];
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  country?: string | null;
  website?: string | null;
  created_at?: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  type: VariantType;
  size_ml: number;
  price_lkr: number;
  compare_at_price_lkr?: number | null;
  sku: string;
  is_active: boolean;
  purchasable?: boolean;
};

export type Product = {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  concentration: Concentration;
  description: string | null;
  notes: FragranceNotes;
  images: string[];
  is_active: boolean;
  gender?: ProductGender | null;
  longevity?: string | null;
  projection?: string | null;
  season?: string | null;
  occasion?: string | null;
  country_of_origin?: string | null;
  year_released?: number | null;
  perfumers?: string[];
  collection?: ProductCollection;
  inspired_by?: string | null;
  brand?: Brand;
  variants?: ProductVariant[];
  avg_rating?: number | null;
  review_count?: number;
};

export type InventoryLot = {
  id: string;
  product_id: string;
  fill_ml: number;
  remaining_ml: number;
  status: LotStatus;
  cost_lkr: number | null;
  notes: string | null;
  received_at: string;
  product?: Product;
};

export type InventoryEvent = {
  id: string;
  lot_id: string | null;
  product_id: string;
  kind: InventoryEventKind;
  delta_ml: number;
  note: string | null;
  created_by: string | null;
  created_at: string;
};

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

export type StockSummary = {
  sealedBottles: number;
  openMl: number;
};

export type ProductFilters = {
  brand?: string;
  concentration?: string;
  type?: string;
  q?: string;
  collection?: ProductCollection;
  gender?: ProductGender;
  note?: string;
  size_ml?: string;
  min_price?: string;
  max_price?: string;
  available?: string;
  sort?: ProductSort;
  order?: ProductSortOrder;
};
