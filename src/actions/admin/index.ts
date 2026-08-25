"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidateCatalog } from "@/actions/_shared";
import { requireAdmin } from "@/lib/auth";
import {
  MAX_CATALOG_CSV_BYTES,
  parseCatalogCsv,
  parseCollectionCell,
  parseConcentrationCell,
  parseGenderCell,
  parseVariantPackJson,
  type CatalogImportResult,
} from "@/lib/catalog/import";
import { buildVariantSku } from "@/lib/catalog/sku";
import type { Database } from "@/lib/supabase/database.types";
import type { OrderStatus, ReturnStatus, VariantType } from "@/types";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];
type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];
type VariantInsert = Database["public"]["Tables"]["product_variants"]["Insert"];
type BrandInsert = Database["public"]["Tables"]["brands"]["Insert"];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

function getImageFiles(formData: FormData, key = "image_files") {
  return formData
    .getAll(key)
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

function sanitizeSlug(slug: string, fallback = "item") {
  return (
    slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback
  );
}

function slugFromName(name: string, fallback = "item") {
  return sanitizeSlug(name, fallback);
}

async function uniqueSlug(
  service: SupabaseClient,
  table: "products" | "brands",
  name: string,
  excludeId?: string,
  reserved?: Set<string>,
) {
  const base = slugFromName(name, table === "brands" ? "brand" : "product");
  for (let n = 0; n < 50; n++) {
    const candidate = n === 0 ? base : `${base}-${n + 1}`;
    if (reserved?.has(candidate)) continue;
    let query = service.from(table).select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) {
      reserved?.add(candidate);
      return candidate;
    }
  }
  const fallback = `${base}-${Date.now().toString(36)}`;
  reserved?.add(fallback);
  return fallback;
}

function splitList(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function uniqueVariantSku(
  service: SupabaseClient,
  base: string,
  excludeId?: string,
  reserved?: Set<string>,
) {
  for (let n = 0; n < 50; n++) {
    const candidate = n === 0 ? base : `${base}-${n + 1}`;
    const key = candidate.toLowerCase();
    if (reserved?.has(key)) continue;
    let query = service.from("product_variants").select("id").eq("sku", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) {
      reserved?.add(key);
      return candidate;
    }
  }
  const fallback = `${base}-${Date.now().toString(36).slice(-4)}`;
  reserved?.add(fallback.toLowerCase());
  return fallback;
}

type BrandRef = { name: string; slug: string };

function parseBrandRef(
  brands: BrandRef | BrandRef[] | null | undefined,
): BrandRef {
  if (Array.isArray(brands)) return brands[0] ?? { name: "Brand", slug: "brand" };
  return brands ?? { name: "Brand", slug: "brand" };
}

async function resolveVariantSku(
  service: SupabaseClient,
  input: {
    productId: string;
    type: string;
    sizeMl: number;
    variantId?: string;
    reserved?: Set<string>;
  },
) {
  const { data: product, error } = await service
    .from("products")
    .select("name, slug, brands(name, slug)")
    .eq("id", input.productId)
    .single();
  if (error || !product) throw new Error(error?.message ?? "Product not found");

  const brand = parseBrandRef(
    product.brands as BrandRef | BrandRef[] | null | undefined,
  );
  const base = buildVariantSku({
    brandName: brand.name,
    brandSlug: brand.slug,
    productName: product.name,
    productSlug: product.slug,
    type: input.type,
    sizeMl: input.sizeMl,
  });

  if (input.variantId) {
    const { data: existing } = await service
      .from("product_variants")
      .select("sku, type, size_ml")
      .eq("id", input.variantId)
      .single();
    const identityChanged =
      !existing ||
      existing.type !== input.type ||
      Number(existing.size_ml) !== input.sizeMl;
    if (!identityChanged && existing?.sku) {
      input.reserved?.add(existing.sku.toLowerCase());
      return existing.sku;
    }
    return uniqueVariantSku(service, base, input.variantId, input.reserved);
  }

  return uniqueVariantSku(service, base, undefined, input.reserved);
}

type VariantWrite = {
  productId: string;
  type: VariantType;
  sizeMl: number;
  priceLkr: number;
  compareAt?: number | null;
  compareAtProvided?: boolean;
  sku?: string | null;
  isActive?: boolean;
  variantId?: string;
};

async function writeVariant(
  service: SupabaseClient,
  input: VariantWrite,
  reservedSkus?: Set<string>,
) {
  const sku = input.sku?.trim()
    ? await uniqueVariantSku(
        service,
        input.sku.trim(),
        input.variantId,
        reservedSkus,
      )
    : await resolveVariantSku(service, {
        productId: input.productId,
        type: input.type,
        sizeMl: input.sizeMl,
        variantId: input.variantId,
        reserved: reservedSkus,
      });

  const payload: VariantInsert = {
    product_id: input.productId,
    type: input.type,
    size_ml: input.sizeMl,
    price_lkr: input.priceLkr,
    sku,
  };
  if (!input.variantId || input.compareAtProvided) {
    payload.compare_at_price_lkr = input.compareAt ?? null;
  }
  if (input.isActive !== undefined) payload.is_active = input.isActive;
  else if (!input.variantId) payload.is_active = true;

  if (input.variantId) {
    const { error } = await service
      .from("product_variants")
      .update(payload)
      .eq("id", input.variantId);
    if (error) throw new Error(error.message);
    return { id: input.variantId, sku, created: false };
  }

  const { data, error } = await service
    .from("product_variants")
    .insert(payload)
    .select("id, sku")
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id, sku: data.sku, created: true };
}

async function uploadToBucket(
  service: SupabaseClient,
  bucket: string,
  folder: string,
  files: File[],
) {
  const urls: string[] = [];
  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      throw new Error(
        `Unsupported image type "${file.type || "unknown"}" for ${file.name}`,
      );
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error(`${file.name} is larger than 5MB`);
    }
    const ext =
      file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
      "jpg";
    const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const body = Buffer.from(await file.arrayBuffer());
    const { error } = await service.storage.from(bucket).upload(path, body, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data } = service.storage.from(bucket).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

function productPayload(formData: FormData, images: string[], slug: string) {
  const year = String(formData.get("year_released") || "");
  const gender = parseGenderCell(String(formData.get("gender") || ""));
  const collection = parseCollectionCell(
    String(formData.get("collection") || "core"),
  );
  const concentration = parseConcentrationCell(
    String(formData.get("concentration")),
  );
  const notes = {
    top: splitList(formData.get("notes_top")),
    heart: splitList(formData.get("notes_heart")),
    base: splitList(formData.get("notes_base")),
  };
  const payload: ProductInsert = {
    brand_id: String(formData.get("brand_id")),
    name: String(formData.get("name")),
    slug,
    concentration: concentration ?? "EDP",
    description: String(formData.get("description") || ""),
    notes,
    images,
    is_active: formData.get("is_active") === "on",
    gender: gender ?? null,
    longevity: String(formData.get("longevity") || "") || null,
    projection: String(formData.get("projection") || "") || null,
    season: String(formData.get("season") || "") || null,
    occasion: String(formData.get("occasion") || "") || null,
    country_of_origin: String(formData.get("country_of_origin") || "") || null,
    year_released: year ? Number(year) : null,
    perfumers: splitList(formData.get("perfumers")),
    collection: collection ?? "core",
    inspired_by: String(formData.get("inspired_by") || "").trim() || null,
  };
  return { payload, notes };
}

export async function upsertProduct(formData: FormData) {
  const { service } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "");
  if (!name.trim()) throw new Error("Name is required");

  let slug: string;
  if (id) {
    const { data: existing, error } = await service
      .from("products")
      .select("slug")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    slug = existing.slug;
  } else {
    slug = await uniqueSlug(service, "products", name);
  }

  const uploaded = await uploadToBucket(
    service,
    "product-images",
    slug,
    getImageFiles(formData),
  );

  const kept = formData
    .getAll("existing_images")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const images = id ? [...kept, ...uploaded] : uploaded.length ? uploaded : kept;

  const { payload, notes } = productPayload(formData, images, slug);
  const pack = parseVariantPackJson(String(formData.get("variant_pack") || ""));

  if (id) {
    const notesEmpty =
      !notes.top.length && !notes.heart.length && !notes.base.length;
    if (notesEmpty) {
      const { data: existing } = await service
        .from("products")
        .select("notes")
        .eq("id", id)
        .single();
      if (existing?.notes) payload.notes = existing.notes;
    }
    const { error } = await service.from("products").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
    await syncProductVariants(service, id, pack);
  } else {
    const { data, error } = await service
      .from("products")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await syncProductVariants(service, data.id, pack);
  }

  revalidateCatalog();
}

export async function deleteProduct(formData: FormData) {
  const { service } = await requireAdmin();
  const id = String(formData.get("id"));

  const { error: lotsError } = await service
    .from("inventory_lots")
    .delete()
    .eq("product_id", id);
  if (lotsError) throw new Error(lotsError.message);

  const { error } = await service.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateCatalog();
}

async function syncProductVariants(
  service: SupabaseClient,
  productId: string,
  pack: ReturnType<typeof parseVariantPackJson>,
) {
  const { data: existing, error } = await service
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);
  if (error) throw new Error(error.message);

  const keepIds = new Set(
    pack.map((variant) => variant.id).filter((id): id is string => Boolean(id)),
  );
  const removed = (existing ?? []).filter((variant) => !keepIds.has(variant.id));
  if (removed.length) {
    const { error: deleteError } = await service
      .from("product_variants")
      .delete()
      .in(
        "id",
        removed.map((variant) => variant.id),
      );
    if (deleteError) throw new Error(deleteError.message);
  }

  for (const variant of pack) {
    await writeVariant(service, {
      productId,
      type: variant.type,
      sizeMl: variant.size_ml,
      priceLkr: variant.price_lkr,
      compareAt: variant.compare_at_price_lkr ?? null,
      compareAtProvided: true,
      isActive: variant.id ? undefined : (variant.is_active ?? true),
      variantId: variant.id,
    });
  }
}

export async function deleteBrand(formData: FormData) {
  const { service } = await requireAdmin();
  const id = String(formData.get("id"));

  const { data: products, error: productsError } = await service
    .from("products")
    .select("id")
    .eq("brand_id", id);
  if (productsError) throw new Error(productsError.message);

  const productIds = (products ?? []).map((product) => product.id);
  if (productIds.length) {
    const { error: lotsError } = await service
      .from("inventory_lots")
      .delete()
      .in("product_id", productIds);
    if (lotsError) throw new Error(lotsError.message);

    const { error: deleteProductsError } = await service
      .from("products")
      .delete()
      .in("id", productIds);
    if (deleteProductsError) throw new Error(deleteProductsError.message);
  }

  const { error } = await service.from("brands").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateCatalog();
}

export async function duplicateProduct(formData: FormData) {
  const { service } = await requireAdmin();
  const id = String(formData.get("id"));
  const { data: product, error } = await service
    .from("products")
    .select("*, brands(name, slug), product_variants(*)")
    .eq("id", id)
    .single();
  if (error || !product) throw new Error(error?.message ?? "Not found");

  const slug = `${product.slug}-copy-${Date.now().toString(36).slice(-4)}`;
  const { data: created, error: insertError } = await service
    .from("products")
    .insert({
      brand_id: product.brand_id,
      name: `${product.name} (Copy)`,
      slug,
      concentration: product.concentration,
      description: product.description,
      notes: product.notes,
      images: product.images,
      is_active: false,
      gender: product.gender,
      longevity: product.longevity,
      projection: product.projection,
      season: product.season,
      occasion: product.occasion,
      country_of_origin: product.country_of_origin,
      year_released: product.year_released,
      perfumers: product.perfumers,
      collection: product.collection,
      inspired_by: product.inspired_by,
    })
    .select("id")
    .single();
  if (insertError || !created) throw new Error(insertError?.message ?? "Insert failed");

  const variants = (product.product_variants ?? []) as {
    type: VariantType;
    size_ml: number;
    price_lkr: number;
    compare_at_price_lkr: number | null;
    sku: string;
    is_active: boolean;
  }[];
  if (variants.length) {
    const brand = parseBrandRef(
      product.brands as BrandRef | BrandRef[] | null | undefined,
    );
    const copiedName = `${product.name} (Copy)`;
    const variantRows = await Promise.all(
      variants.map(async (v) => ({
        product_id: created.id,
        type: v.type,
        size_ml: v.size_ml,
        price_lkr: v.price_lkr,
        compare_at_price_lkr: v.compare_at_price_lkr,
        sku: await uniqueVariantSku(
          service,
          buildVariantSku({
            brandName: brand.name,
            brandSlug: brand.slug,
            productName: copiedName,
            productSlug: slug,
            type: v.type,
            sizeMl: Number(v.size_ml),
          }),
        ),
        is_active: v.is_active,
      })),
    );
    const { error: vError } = await service.from("product_variants").insert(variantRows);
    if (vError) throw new Error(vError.message);
  }

  revalidateCatalog();
}

export async function appendProductImages(formData: FormData) {
  const { service } = await requireAdmin();
  const productId = String(formData.get("product_id") || "");
  const slug = String(formData.get("slug") || "");
  if (!productId || !slug) throw new Error("Missing product");

  const files = getImageFiles(formData);
  if (!files.length) throw new Error("Choose at least one image");

  const uploaded = await uploadToBucket(
    service,
    "product-images",
    sanitizeSlug(slug),
    files,
  );

  const { data: product, error: fetchError } = await service
    .from("products")
    .select("images")
    .eq("id", productId)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const existing = ((product.images as string[] | null) ?? []).filter(
    (url) => !url.startsWith("/products/"),
  );
  const { error } = await service
    .from("products")
    .update({ images: [...existing, ...uploaded] })
    .eq("id", productId);
  if (error) throw new Error(error.message);

  revalidateCatalog();
  revalidatePath(`/product/${slug}`);
}

export async function importCatalogCsv(
  formData: FormData,
): Promise<CatalogImportResult> {
  const { service } = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a CSV file");
  }
  if (file.size > MAX_CATALOG_CSV_BYTES) {
    throw new Error("CSV is larger than 2MB");
  }

  let parsed;
  try {
    parsed = parseCatalogCsv(await file.text());
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Could not parse CSV");
  }

  const errors = [...parsed.errors];
  const result: CatalogImportResult = {
    createdBrands: 0,
    updatedProducts: 0,
    createdProducts: 0,
    createdVariants: 0,
    updatedVariants: 0,
    errors,
  };

  if (!parsed.rows.length) return result;

  const [{ data: brands }, { data: products }, { data: variants }] =
    await Promise.all([
      service.from("brands").select("id, name, slug"),
      service.from("products").select("id, brand_id, name, slug"),
      service.from("product_variants").select("id, product_id, type, size_ml, sku"),
    ]);

  const brandByName = new Map<
    string,
    { id: string; name: string; slug: string }
  >();
  const reservedBrandSlugs = new Set<string>();
  for (const brand of brands ?? []) {
    brandByName.set(brand.name.trim().toLowerCase(), brand);
    reservedBrandSlugs.add(brand.slug);
  }

  type ProductCache = {
    id: string;
    brand_id: string;
    name: string;
    slug: string;
    applied: boolean;
  };
  const productByKey = new Map<string, ProductCache>();
  const reservedProductSlugs = new Set<string>();
  for (const product of products ?? []) {
    productByKey.set(`${product.brand_id}::${product.name.trim().toLowerCase()}`, {
      ...product,
      applied: false,
    });
    reservedProductSlugs.add(product.slug);
  }

  const variantByKey = new Map<string, { id: string; sku: string }>();
  const reservedSkus = new Set<string>();
  for (const variant of variants ?? []) {
    variantByKey.set(
      `${variant.product_id}:${variant.type}:${Number(variant.size_ml)}`,
      { id: variant.id, sku: variant.sku },
    );
    reservedSkus.add(variant.sku.toLowerCase());
  }

  for (const row of parsed.rows) {
    try {
      const brandKey = row.brand.trim().toLowerCase();
      let brand = brandByName.get(brandKey);
      if (!brand) {
        const slug = await uniqueSlug(
          service,
          "brands",
          row.brand.trim(),
          undefined,
          reservedBrandSlugs,
        );
        const { data, error } = await service
          .from("brands")
          .insert({ name: row.brand.trim(), slug })
          .select("id, name, slug")
          .single();
        if (error) throw new Error(error.message);
        brand = data;
        brandByName.set(brandKey, brand);
        result.createdBrands += 1;
      }

      const productKey = `${brand.id}::${row.name.trim().toLowerCase()}`;
      let product = productByKey.get(productKey);

      if (!product) {
        const slug = await uniqueSlug(
          service,
          "products",
          row.name.trim(),
          undefined,
          reservedProductSlugs,
        );
        const payload = {
          brand_id: brand.id,
          name: row.name.trim(),
          slug,
          concentration: row.concentration,
          description: row.description || "",
          notes: {
            top: row.notesTop,
            heart: row.notesHeart,
            base: row.notesBase,
          },
          images: [] as string[],
          is_active: row.isActive,
          gender: row.gender,
          longevity: row.longevity || null,
          projection: row.projection || null,
          season: row.season || null,
          occasion: row.occasion || null,
          country_of_origin: row.countryOfOrigin || null,
          year_released: row.yearReleased,
          perfumers: row.perfumers,
          collection: row.collection,
          inspired_by: row.inspiredBy || null,
        };
        const { data, error } = await service
          .from("products")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        product = {
          id: data.id,
          brand_id: brand.id,
          name: row.name.trim(),
          slug,
          applied: true,
        };
        productByKey.set(productKey, product);
        result.createdProducts += 1;
      } else if (!product.applied) {
        const update: ProductUpdate = {};
        if (row.concentrationProvided) update.concentration = row.concentration;
        if (row.description) update.description = row.description;
        if (row.genderProvided) update.gender = row.gender;
        if (row.collectionProvided) update.collection = row.collection;
        if (row.notesProvided) {
          update.notes = {
            top: row.notesTop,
            heart: row.notesHeart,
            base: row.notesBase,
          };
        }
        if (row.perfumersProvided) update.perfumers = row.perfumers;
        if (row.longevity) update.longevity = row.longevity;
        if (row.projection) update.projection = row.projection;
        if (row.season) update.season = row.season;
        if (row.occasion) update.occasion = row.occasion;
        if (row.countryOfOrigin) update.country_of_origin = row.countryOfOrigin;
        if (row.yearProvided) update.year_released = row.yearReleased;
        if (row.inspiredByProvided) update.inspired_by = row.inspiredBy || null;
        if (row.isActiveProvided) update.is_active = row.isActive;

        if (Object.keys(update).length) {
          const { error } = await service
            .from("products")
            .update(update)
            .eq("id", product.id);
          if (error) throw new Error(error.message);
          result.updatedProducts += 1;
        }
        product.applied = true;
        productByKey.set(productKey, product);
      }

      if (!row.hasVariant) continue;
      if (!row.type || row.sizeMl == null || row.priceLkr == null) {
        errors.push({
          row: row.rowNumber,
          message: "Variant is missing type, size, or price",
        });
        continue;
      }

      const variantKey = `${product.id}:${row.type}:${Number(row.sizeMl)}`;
      const existingVariant = variantByKey.get(variantKey);
      const written = await writeVariant(
        service,
        {
          productId: product.id,
          type: row.type,
          sizeMl: row.sizeMl,
          priceLkr: row.priceLkr,
          compareAt: row.compareAt,
          compareAtProvided: row.compareProvided,
          isActive: existingVariant ? undefined : true,
          variantId: existingVariant?.id,
        },
        reservedSkus,
      );
      variantByKey.set(variantKey, { id: written.id, sku: written.sku });
      if (written.created) result.createdVariants += 1;
      else result.updatedVariants += 1;
    } catch (err) {
      errors.push({
        row: row.rowNumber,
        message: err instanceof Error ? err.message : "Could not import row",
      });
    }
  }

  revalidateCatalog();
  return result;
}

export async function receiveInventory(formData: FormData) {
  const { service, userId } = await requireAdmin();
  const fill = Number(formData.get("fill_ml"));
  const qty = Number(formData.get("quantity") || 1);
  const productId = String(formData.get("product_id"));
  const rows = Array.from({ length: qty }).map(() => ({
    product_id: productId,
    fill_ml: fill,
    remaining_ml: fill,
    status: "sealed" as const,
    cost_lkr: formData.get("cost_lkr")
      ? Number(formData.get("cost_lkr"))
      : null,
    notes: String(formData.get("notes") || "") || null,
  }));

  const { data, error } = await service
    .from("inventory_lots")
    .insert(rows)
    .select("id");
  if (error) throw new Error(error.message);

  await service.from("inventory_events").insert(
    (data ?? []).map((lot) => ({
      lot_id: lot.id,
      product_id: productId,
      kind: "receive" as const,
      delta_ml: fill,
      note: String(formData.get("notes") || "") || null,
      created_by: userId,
    })),
  );

  revalidatePath("/admin/inventory");
}

export async function openLot(lotId: string) {
  const { service, userId } = await requireAdmin();
  const { data: lot } = await service
    .from("inventory_lots")
    .select("product_id, fill_ml")
    .eq("id", lotId)
    .single();
  const { error } = await service.rpc("open_lot_for_decanting", {
    lot_id: lotId,
  });
  if (error) throw new Error(error.message);
  if (lot) {
    await service.from("inventory_events").insert({
      lot_id: lotId,
      product_id: lot.product_id,
      kind: "open",
      delta_ml: 0,
      note: "Opened for decanting",
      created_by: userId,
    });
  }
  revalidatePath("/admin/inventory");
}

export async function resealLot(lotId: string) {
  const { service } = await requireAdmin();
  const { data: lot, error: fetchError } = await service
    .from("inventory_lots")
    .select("id, product_id, status, fill_ml, remaining_ml")
    .eq("id", lotId)
    .single();
  if (fetchError || !lot) throw new Error(fetchError?.message ?? "Lot not found");
  if (lot.status !== "open") throw new Error("Only open lots can be resealed");
  if (Number(lot.remaining_ml) !== Number(lot.fill_ml)) {
    throw new Error("Can't reseal after juice has been used");
  }

  const { error } = await service
    .from("inventory_lots")
    .update({
      status: "sealed",
      remaining_ml: lot.fill_ml,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lotId)
    .eq("status", "open");
  if (error) throw new Error(error.message);

  const { data: openEvent } = await service
    .from("inventory_events")
    .select("id")
    .eq("lot_id", lotId)
    .eq("kind", "open")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (openEvent) {
    await service.from("inventory_events").delete().eq("id", openEvent.id);
  }

  revalidatePath("/admin/inventory");
}

export async function adjustInventory(formData: FormData) {
  const { service, userId } = await requireAdmin();
  const lotId = String(formData.get("lot_id"));
  const kind = String(formData.get("kind")) as "adjust" | "loss" | "sample";
  const delta = Number(formData.get("delta_ml"));
  const note = String(formData.get("note") || "") || null;

  const { data: lot, error: fetchError } = await service
    .from("inventory_lots")
    .select("*")
    .eq("id", lotId)
    .single();
  if (fetchError || !lot) throw new Error(fetchError?.message ?? "Lot not found");
  if (lot.status !== "open") {
    throw new Error("Only open lots can be adjusted");
  }

  const next = Math.max(0, Number(lot.remaining_ml) + delta);
  const status = next <= 0 ? "depleted" : "open";

  const { error } = await service
    .from("inventory_lots")
    .update({ remaining_ml: next, status, updated_at: new Date().toISOString() })
    .eq("id", lotId);
  if (error) throw new Error(error.message);

  await service.from("inventory_events").insert({
    lot_id: lotId,
    product_id: lot.product_id,
    kind,
    delta_ml: delta,
    note,
    created_by: userId,
  });

  revalidatePath("/admin/inventory");
}

export async function updateOrderStatus(formData: FormData) {
  const { service } = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as OrderStatus;
  const tracking = String(formData.get("tracking_number") || "") || null;
  const payload: OrderUpdate = { status, tracking_number: tracking };
  if (status === "shipped") {
    payload.shipped_at = new Date().toISOString();
  }
  const { error } = await service.from("orders").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/orders/${id}`);
  revalidatePath(`/admin/orders/${id}/invoice`);
}

export async function upsertBrand(formData: FormData) {
  const { service } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "");
  if (!name.trim()) throw new Error("Name is required");

  let slug: string;
  if (id) {
    const { data: existing, error } = await service
      .from("brands")
      .select("slug")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    slug = existing.slug;
  } else {
    slug = await uniqueSlug(service, "brands", name);
  }

  const logoFiles = getImageFiles(formData, "logo_file");
  const bannerFiles = getImageFiles(formData, "banner_file");
  const logos = await uploadToBucket(service, "brand-assets", slug, logoFiles);
  const banners = await uploadToBucket(
    service,
    "brand-assets",
    `${slug}/banner`,
    bannerFiles,
  );

  const keptLogo = String(formData.get("existing_logo_url") || "").trim();
  const keptBanner = String(formData.get("existing_banner_url") || "").trim();

  const payload: BrandInsert = {
    name,
    slug,
    description: String(formData.get("description") || "") || null,
    country: String(formData.get("country") || "") || null,
    website: String(formData.get("website") || "") || null,
  };
  if (logos[0]) payload.logo_url = logos[0];
  else if (id) payload.logo_url = keptLogo || null;
  if (banners[0]) payload.banner_url = banners[0];
  else if (id) payload.banner_url = keptBanner || null;

  if (id) {
    const { error } = await service.from("brands").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await service.from("brands").insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidateCatalog();
}

export async function createBrand(formData: FormData) {
  return upsertBrand(formData);
}

export async function approveReview(formData: FormData) {
  const { service } = await requireAdmin();
  const id = String(formData.get("id"));
  const approved = formData.get("approved") === "on";
  const { error } = await service
    .from("reviews")
    .update({ is_approved: approved })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/reviews");
  revalidatePath("/shop");
}

export async function updateReturnStatus(formData: FormData) {
  const { service } = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as ReturnStatus;
  const admin_note = String(formData.get("admin_note") || "") || null;
  const { error } = await service
    .from("return_requests")
    .update({ status, admin_note, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
  revalidatePath("/account/returns");
}
