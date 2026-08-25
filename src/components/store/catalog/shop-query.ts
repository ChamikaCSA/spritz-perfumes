import type { ProductGender, ProductSort } from "@/types";

export type ShopQuery = {
  brand?: string;
  concentration?: string;
  type?: string;
  q?: string;
  gender?: string;
  note?: string;
  size_ml?: string;
  min_price?: string;
  max_price?: string;
  available?: string;
  sort?: string;
  order?: string;
};

export const CONCENTRATIONS = ["EDT", "EDP", "Parfum", "Extrait", "EDC"];
export const GENDERS: ProductGender[] = ["women", "men", "unisex"];
export const SIZES = ["2", "5", "10", "50", "100"];
export const SORTS: { value: ProductSort; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "newest", label: "Newest" },
  { value: "price", label: "Price" },
  { value: "popularity", label: "Popular" },
  { value: "rating", label: "Rating" },
];

export const FORMATS = [
  { value: undefined, label: "All" },
  { value: "full_size", label: "Full size" },
  { value: "decant", label: "Decants" },
] as const;

export function buildShopUrl(params: ShopQuery) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) sp.set(k, v);
  });
  const qs = sp.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export function advancedFilterCount(params: ShopQuery) {
  return [
    params.concentration,
    params.gender,
    params.size_ml,
    params.min_price,
    params.max_price,
    params.note,
    params.available,
    params.brand,
  ].filter(Boolean).length;
}

export type ShopFilterDraft = {
  concentration: string;
  gender: string;
  size_ml: string;
  available: string;
  min_price: string;
  max_price: string;
  note: string;
};

export function shopFilterDraft(params: ShopQuery): ShopFilterDraft {
  return {
    concentration: params.concentration ?? "",
    gender: params.gender ?? "",
    size_ml: params.size_ml ?? "",
    available: params.available ?? "",
    min_price: params.min_price ?? "",
    max_price: params.max_price ?? "",
    note: params.note ?? "",
  };
}

export const EMPTY_FILTER_DRAFT: ShopFilterDraft = {
  concentration: "",
  gender: "",
  size_ml: "",
  available: "",
  min_price: "",
  max_price: "",
  note: "",
};
