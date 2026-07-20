const ARTICLE_WORDS = new Set([
  "de",
  "la",
  "le",
  "du",
  "des",
  "the",
  "and",
  "of",
]);

export function brandSkuCode(name: string, slug: string): string {
  const parts = slug.split("-").filter(Boolean);
  if (parts.length > 1) {
    return parts.map((part) => part[0]).join("").toUpperCase();
  }

  const compact = slug.replace(/-/g, "").toUpperCase();
  if (compact.length <= 4) return compact;

  const letters = name.replace(/[^a-zA-Z]/g, "");
  return (letters.slice(0, 3) || compact.slice(0, 3)).toUpperCase();
}

function productWordCode(word: string): string {
  const cleaned = word.replace(/[^a-zA-Z0-9]/g, "");
  if (!cleaned) return "";
  if (/^\d+$/.test(cleaned)) return cleaned;
  return cleaned.charAt(0);
}

export function productSkuCode(name: string, slug: string): string {
  const normalizedName = name.replace(/\s*\([^)]*\)\s*$/g, "").trim();
  const words = normalizedName
    .trim()
    .split(/\s+/)
    .filter((word) => !ARTICLE_WORDS.has(word.toLowerCase()));

  if (words.length > 1) {
    const initials = words.map(productWordCode).filter(Boolean).join("");
    if (initials.length >= 2) return initials.toUpperCase();
  }

  const alnum = normalizedName.replace(/[^a-zA-Z0-9]/g, "");
  if (alnum.length >= 3) return alnum.slice(0, 3).toUpperCase();

  const fromSlug = slug.replace(/-/g, "");
  return (alnum || fromSlug).slice(0, 3).toUpperCase() || "PRD";
}

export function variantSkuSizeSuffix(
  type: "full_size" | "decant" | string,
  sizeMl: number,
): string {
  const size = Number.isInteger(sizeMl)
    ? String(sizeMl)
    : String(sizeMl).replace(".", "");
  return type === "decant" ? `D${size}` : size;
}

export function buildVariantSku(input: {
  brandName: string;
  brandSlug: string;
  productName: string;
  productSlug: string;
  type: string;
  sizeMl: number;
}): string {
  const brand = brandSkuCode(input.brandName, input.brandSlug);
  const product = productSkuCode(input.productName, input.productSlug);
  const size = variantSkuSizeSuffix(input.type, input.sizeMl);
  return `${brand}-${product}-${size}`;
}
