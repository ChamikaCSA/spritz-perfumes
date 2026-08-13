export const CATALOG_STYLE_COOKIE = "spritz_catalog_style";

export const CATALOG_STYLES = ["compact", "list"] as const;
export type CatalogStyle = (typeof CATALOG_STYLES)[number];

export const DEFAULT_CATALOG_STYLE: CatalogStyle = "compact";

export function parseCatalogStyle(value?: string | null): CatalogStyle {
  if (value === "compact" || value === "list") {
    return value;
  }
  return DEFAULT_CATALOG_STYLE;
}

export function productCatalogClass(style: CatalogStyle) {
  if (style === "list") {
    return "divide-y divide-border/40 border-y border-border/40";
  }
  return "grid grid-cols-2 *:border-r *:border-b *:border-border/40 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
}

export function brandCatalogClass(style: CatalogStyle) {
  return productCatalogClass(style);
}
