import type {
  Concentration,
  ProductCollection,
  ProductGender,
  VariantType,
} from "@/types";

export const CONCENTRATIONS: Concentration[] = [
  "EDT",
  "EDP",
  "Parfum",
  "Extrait",
  "EDC",
  "Other",
];

export const PRODUCT_COLLECTIONS: ProductCollection[] = [
  "core",
  "gift_set",
  "new",
  "sale",
  "limited",
];

export const PRODUCT_GENDERS: ProductGender[] = ["women", "men", "unisex"];

export const VARIANT_TYPES: VariantType[] = ["full_size", "decant"];

export const CATALOG_CSV_HEADERS = [
  "brand",
  "name",
  "concentration",
  "description",
  "gender",
  "collection",
  "notes_top",
  "notes_heart",
  "notes_base",
  "perfumers",
  "longevity",
  "projection",
  "season",
  "occasion",
  "country_of_origin",
  "year_released",
  "inspired_by",
  "is_active",
  "type",
  "size_ml",
  "price_lkr",
  "compare_at_price_lkr",
] as const;

export const MAX_CATALOG_CSV_BYTES = 2 * 1024 * 1024;
export const MAX_CATALOG_CSV_ROWS = 2000;

const HEADER_ALIASES: Record<string, (typeof CATALOG_CSV_HEADERS)[number]> = {
  brand: "brand",
  brand_name: "brand",
  maison: "brand",
  name: "name",
  product: "name",
  product_name: "name",
  fragrance: "name",
  concentration: "concentration",
  conc: "concentration",
  description: "description",
  desc: "description",
  gender: "gender",
  collection: "collection",
  notes_top: "notes_top",
  top: "notes_top",
  top_notes: "notes_top",
  notes_heart: "notes_heart",
  heart: "notes_heart",
  heart_notes: "notes_heart",
  middle: "notes_heart",
  middle_notes: "notes_heart",
  notes_base: "notes_base",
  base: "notes_base",
  base_notes: "notes_base",
  perfumers: "perfumers",
  perfumer: "perfumers",
  longevity: "longevity",
  projection: "projection",
  sillage: "projection",
  season: "season",
  occasion: "occasion",
  country: "country_of_origin",
  country_of_origin: "country_of_origin",
  origin: "country_of_origin",
  year: "year_released",
  year_released: "year_released",
  inspired_by: "inspired_by",
  inspired: "inspired_by",
  dupe: "inspired_by",
  dupe_of: "inspired_by",
  impression: "inspired_by",
  impression_of: "inspired_by",
  is_active: "is_active",
  active: "is_active",
  product_active: "is_active",
  type: "type",
  variant_type: "type",
  size: "size_ml",
  size_ml: "size_ml",
  ml: "size_ml",
  price: "price_lkr",
  price_lkr: "price_lkr",
  compare_at: "compare_at_price_lkr",
  compare: "compare_at_price_lkr",
  compare_at_price_lkr: "compare_at_price_lkr",
};

export type CatalogImportError = {
  row: number;
  message: string;
};

export type CatalogCsvParsedRow = {
  rowNumber: number;
  brand: string;
  name: string;
  concentration: Concentration;
  concentrationProvided: boolean;
  description: string;
  gender: ProductGender | null;
  genderProvided: boolean;
  collection: ProductCollection;
  collectionProvided: boolean;
  notesTop: string[];
  notesHeart: string[];
  notesBase: string[];
  notesProvided: boolean;
  perfumers: string[];
  perfumersProvided: boolean;
  longevity: string;
  projection: string;
  season: string;
  occasion: string;
  countryOfOrigin: string;
  yearReleased: number | null;
  yearProvided: boolean;
  inspiredBy: string;
  inspiredByProvided: boolean;
  isActive: boolean;
  isActiveProvided: boolean;
  type: VariantType | null;
  sizeMl: number | null;
  priceLkr: number | null;
  compareAt: number | null;
  compareProvided: boolean;
  hasVariant: boolean;
};

export type CatalogImportResult = {
  createdBrands: number;
  updatedProducts: number;
  createdProducts: number;
  createdVariants: number;
  updatedVariants: number;
  errors: CatalogImportError[];
};

function normalizeHeader(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s/]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export function splitNotes(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseBooleanCell(value: string, fallback: boolean) {
  const v = value.trim().toLowerCase();
  if (!v) return fallback;
  if (["1", "true", "yes", "y", "on"].includes(v)) return true;
  if (["0", "false", "no", "n", "off"].includes(v)) return false;
  return null;
}

export function parseNumberCell(value: string) {
  const cleaned = value
    .trim()
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .replace(/^rs\.?/i, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

export function parseConcentrationCell(value: string): Concentration | null | undefined {
  const v = value.trim();
  if (!v) return undefined;
  const upper = v.toUpperCase();
  const aliases: Record<string, Concentration> = {
    EDT: "EDT",
    "EAU DE TOILETTE": "EDT",
    EDP: "EDP",
    "EAU DE PARFUM": "EDP",
    PARFUM: "Parfum",
    PARFUME: "Parfum",
    EXTRAIT: "Extrait",
    EDC: "EDC",
    "EAU DE COLOGNE": "EDC",
    OTHER: "Other",
  };
  return aliases[upper] ?? null;
}

export function parseGenderCell(value: string): ProductGender | null | undefined {
  const v = value.trim().toLowerCase();
  if (!v) return undefined;
  if (["women", "woman", "female", "f", "w"].includes(v)) return "women";
  if (["men", "man", "male", "m"].includes(v)) return "men";
  if (["unisex", "u", "shared"].includes(v)) return "unisex";
  return null;
}

export function parseCollectionCell(
  value: string,
): ProductCollection | null | undefined {
  const v = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (!v) return undefined;
  if (v === "gift" || v === "giftset" || v === "gift_set") return "gift_set";
  if (PRODUCT_COLLECTIONS.includes(v as ProductCollection)) {
    return v as ProductCollection;
  }
  return null;
}

export function parseVariantTypeCell(
  value: string,
  sizeMl: number | null,
): VariantType | null | undefined {
  const v = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (!v) {
    if (sizeMl == null) return undefined;
    return sizeMl >= 30 ? "full_size" : "decant";
  }
  if (["full_size", "full", "fullsize", "bottle", "retail"].includes(v)) {
    return "full_size";
  }
  if (["decant", "d", "sample", "travel"].includes(v)) return "decant";
  return null;
}

export function parseCsv(text: string, delimiter = ","): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
        continue;
      }
      field += c;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      continue;
    }
    if (c === delimiter) {
      row.push(field);
      field = "";
      continue;
    }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      continue;
    }
    field += c;
  }

  if (inQuotes) {
    throw new Error("CSV has an unclosed quoted field");
  }
  row.push(field);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

export function parseCsvDocument(text: string): string[][] {
  const commaRows = parseCsv(text, ",");
  if ((commaRows[0]?.length ?? 0) <= 1 && /;/.test(text)) {
    return parseCsv(text, ";");
  }
  return commaRows;
}

function csvEscape(value: string) {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function buildCatalogCsvTemplate() {
  const example: string[][] = [
    [...CATALOG_CSV_HEADERS],
    [
      "Chanel",
      "Bleu de Chanel",
      "EDP",
      "A woody aromatic around cedar and sandalwood.",
      "men",
      "core",
      "Citrus, Mint, Pink Pepper",
      "Ginger, Nutmeg, Jasmine",
      "Incense, Cedar, Sandalwood",
      "Jacques Polge",
      "8–10 hours",
      "Moderate to strong",
      "Year-round",
      "Day, Evening, Office",
      "France",
      "2014",
      "",
      "true",
      "decant",
      "2",
      "2500",
      "",
    ],
    [
      "Chanel",
      "Bleu de Chanel",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "decant",
      "5",
      "4500",
      "5200",
    ],
    [
      "Chanel",
      "Bleu de Chanel",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "decant",
      "10",
      "7500",
      "",
    ],
    [
      "Chanel",
      "Bleu de Chanel",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "full_size",
      "100",
      "48500",
      "",
    ],
    [
      "Dior",
      "Sauvage",
      "EDP",
      "Fresh spice over ambroxan.",
      "men",
      "core",
      "Calabrian Bergamot, Pepper",
      "Sichuan Pepper, Lavender",
      "Ambroxan, Cedar",
      "Francois Demachy",
      "8 hours",
      "Strong",
      "Year-round",
      "Day",
      "France",
      "2015",
      "",
      "true",
      "decant",
      "5",
      "4200",
      "",
    ],
  ];

  return example.map((row) => row.map(csvEscape).join(",")).join("\r\n") + "\r\n";
}

export function parseCatalogCsv(text: string): {
  rows: CatalogCsvParsedRow[];
  errors: CatalogImportError[];
} {
  const table = parseCsvDocument(text);
  if (!table.length) {
    return { rows: [], errors: [{ row: 1, message: "CSV is empty" }] };
  }

  const header = table[0].map((cell) => HEADER_ALIASES[normalizeHeader(cell)]);
  const brandIndex = header.indexOf("brand");
  const nameIndex = header.indexOf("name");
  if (brandIndex < 0 || nameIndex < 0) {
    return {
      rows: [],
      errors: [
        {
          row: 1,
          message: 'Header row must include "brand" and "name" columns',
        },
      ],
    };
  }

  const dataRows = table.slice(1);
  if (dataRows.length > MAX_CATALOG_CSV_ROWS) {
    return {
      rows: [],
      errors: [
        {
          row: 1,
          message: `CSV has ${dataRows.length} data rows; max is ${MAX_CATALOG_CSV_ROWS}`,
        },
      ],
    };
  }

  const errors: CatalogImportError[] = [];
  const rows: CatalogCsvParsedRow[] = [];
  let prevBrand = "";
  let prevName = "";

  dataRows.forEach((cells, index) => {
    const rowNumber = index + 2;
    const get = (key: (typeof CATALOG_CSV_HEADERS)[number]) => {
      const i = header.indexOf(key);
      return i >= 0 ? (cells[i] ?? "").trim() : "";
    };
    const hasColumn = (key: (typeof CATALOG_CSV_HEADERS)[number]) =>
      header.indexOf(key) >= 0;

    const brand = get("brand") || prevBrand;
    const name = get("name") || prevName;
    if (get("brand")) prevBrand = get("brand");
    if (get("name")) prevName = get("name");

    if (!brand || !name) {
      errors.push({
        row: rowNumber,
        message: "Brand and name are required",
      });
      return;
    }

    const concentrationValue = parseConcentrationCell(get("concentration"));
    if (concentrationValue === null) {
      errors.push({
        row: rowNumber,
        message: `Unknown concentration "${get("concentration")}"`,
      });
      return;
    }

    const genderValue = parseGenderCell(get("gender"));
    if (genderValue === null) {
      errors.push({
        row: rowNumber,
        message: `Unknown gender "${get("gender")}"`,
      });
      return;
    }

    const collectionValue = parseCollectionCell(get("collection"));
    if (collectionValue === null) {
      errors.push({
        row: rowNumber,
        message: `Unknown collection "${get("collection")}"`,
      });
      return;
    }

    const sizeRaw = get("size_ml");
    const priceRaw = get("price_lkr");
    const compareRaw = get("compare_at_price_lkr");
    const yearRaw = get("year_released");

    const sizeMl = sizeRaw ? parseNumberCell(sizeRaw) : null;
    const priceLkr = priceRaw ? parseNumberCell(priceRaw) : null;
    const compareAt = compareRaw ? parseNumberCell(compareRaw) : null;
    const yearReleased = yearRaw ? parseNumberCell(yearRaw) : null;

    if (sizeRaw && (sizeMl == null || Number.isNaN(sizeMl) || sizeMl <= 0)) {
      errors.push({ row: rowNumber, message: `Invalid size_ml "${sizeRaw}"` });
      return;
    }
    if (priceRaw && (priceLkr == null || Number.isNaN(priceLkr) || priceLkr < 0)) {
      errors.push({
        row: rowNumber,
        message: `Invalid price_lkr "${priceRaw}"`,
      });
      return;
    }
    if (
      compareRaw &&
      (compareAt == null || Number.isNaN(compareAt) || compareAt < 0)
    ) {
      errors.push({
        row: rowNumber,
        message: `Invalid compare_at_price_lkr "${compareRaw}"`,
      });
      return;
    }
    if (
      yearRaw &&
      (yearReleased == null ||
        Number.isNaN(yearReleased) ||
        yearReleased < 1800 ||
        yearReleased > 2100)
    ) {
      errors.push({
        row: rowNumber,
        message: `Invalid year_released "${yearRaw}"`,
      });
      return;
    }

    const hasSize = sizeMl != null;
    const hasPrice = priceLkr != null;
    if (hasSize !== hasPrice) {
      errors.push({
        row: rowNumber,
        message: "Variant rows need both size_ml and price_lkr",
      });
      return;
    }

    const typeValue = parseVariantTypeCell(get("type"), sizeMl);
    if (typeValue === null) {
      errors.push({
        row: rowNumber,
        message: `Unknown variant type "${get("type")}"`,
      });
      return;
    }

    const isActive = parseBooleanCell(get("is_active"), true);
    if (isActive === null) {
      errors.push({
        row: rowNumber,
        message: `Invalid is_active "${get("is_active")}"`,
      });
      return;
    }

    const notesTop = splitNotes(get("notes_top"));
    const notesHeart = splitNotes(get("notes_heart"));
    const notesBase = splitNotes(get("notes_base"));
    const notesProvided =
      hasColumn("notes_top") ||
      hasColumn("notes_heart") ||
      hasColumn("notes_base")
        ? Boolean(get("notes_top") || get("notes_heart") || get("notes_base"))
        : false;
    const perfumers = splitNotes(get("perfumers"));

    rows.push({
      rowNumber,
      brand,
      name,
      concentration: concentrationValue ?? "EDP",
      concentrationProvided: concentrationValue !== undefined,
      description: get("description"),
      gender: genderValue ?? null,
      genderProvided: genderValue !== undefined,
      collection: collectionValue ?? "core",
      collectionProvided: collectionValue !== undefined,
      notesTop,
      notesHeart,
      notesBase,
      notesProvided,
      perfumers,
      perfumersProvided: Boolean(get("perfumers")),
      longevity: get("longevity"),
      projection: get("projection"),
      season: get("season"),
      occasion: get("occasion"),
      countryOfOrigin: get("country_of_origin"),
      yearReleased: yearReleased == null ? null : Math.round(yearReleased),
      yearProvided: Boolean(yearRaw),
      inspiredBy: get("inspired_by"),
      inspiredByProvided: Boolean(get("inspired_by")),
      isActive,
      isActiveProvided: Boolean(get("is_active")),
      type: hasSize ? (typeValue ?? null) : null,
      sizeMl,
      priceLkr,
      compareAt,
      compareProvided: Boolean(compareRaw),
      hasVariant: Boolean(hasSize && hasPrice),
    });
  });

  return { rows, errors };
}

export type VariantPackItem = {
  id?: string;
  type: VariantType;
  size_ml: number;
  price_lkr: number;
  compare_at_price_lkr?: number | null;
  is_active?: boolean;
};

export function parseVariantPackJson(raw: string): VariantPackItem[] {
  const text = raw.trim();
  if (!text) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Invalid variant pack");
  }
  if (!Array.isArray(parsed)) return [];

  const items: VariantPackItem[] = [];
  for (const entry of parsed) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const type = String(row.type ?? "");
    const sizeMl = Number(row.size_ml);
    const price = Number(row.price_lkr);
    const compareRaw = row.compare_at_price_lkr;
    if (type !== "decant" && type !== "full_size") continue;
    if (!Number.isFinite(sizeMl) || sizeMl <= 0) continue;
    if (!Number.isFinite(price) || price < 0) continue;
    const compare =
      compareRaw === null || compareRaw === undefined || compareRaw === ""
        ? null
        : Number(compareRaw);
    if (compare != null && (!Number.isFinite(compare) || compare < 0)) continue;
    const id = typeof row.id === "string" ? row.id.trim() : "";
    items.push({
      id: id || undefined,
      type,
      size_ml: sizeMl,
      price_lkr: price,
      compare_at_price_lkr: compare,
      is_active: row.is_active === false ? false : true,
    });
  }

  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.type}:${item.size_ml}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
