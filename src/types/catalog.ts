export type Concentration = "EDT" | "EDP" | "Parfum" | "Extrait" | "EDC" | "Other";
export type VariantType = "full_size" | "decant";
export type ProductCollection = "core" | "gift_set" | "new" | "sale" | "limited";
export type ProductGender = "women" | "men" | "unisex";
export type ProductSort =
  | "name"
  | "newest"
  | "price"
  | "popularity"
  | "rating";
export type ProductSortOrder = "asc" | "desc";

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
