"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/utils-commerce";
import { buildVariantSku } from "@/lib/variant-sku";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

async function requireAdmin() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") throw new Error("Forbidden");
  return { service: createServiceClient(), userId: user.id };
}

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
) {
  const base = slugFromName(name, table === "brands" ? "brand" : "product");
  for (let n = 0; n < 50; n++) {
    const candidate = n === 0 ? base : `${base}-${n + 1}`;
    let query = service.from(table).select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
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
) {
  for (let n = 0; n < 50; n++) {
    const candidate = n === 0 ? base : `${base}-${n + 1}`;
    let query = service.from("product_variants").select("id").eq("sku", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Date.now().toString(36).slice(-4)}`;
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
    if (!identityChanged && existing?.sku) return existing.sku;
    return uniqueVariantSku(service, base, input.variantId);
  }

  return uniqueVariantSku(service, base);
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

function revalidateCatalog() {
  revalidatePath("/admin/products");
  revalidatePath("/admin/brands");
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath("/brands");
}

function productPayload(formData: FormData, images: string[], slug: string) {
  const year = String(formData.get("year_released") || "");
  return {
    brand_id: String(formData.get("brand_id")),
    name: String(formData.get("name")),
    slug,
    concentration: String(formData.get("concentration")),
    description: String(formData.get("description") || ""),
    notes: {
      top: splitList(formData.get("notes_top")),
      heart: splitList(formData.get("notes_heart")),
      base: splitList(formData.get("notes_base")),
    },
    images,
    is_active: formData.get("is_active") === "on",
    gender: String(formData.get("gender") || "") || null,
    longevity: String(formData.get("longevity") || "") || null,
    projection: String(formData.get("projection") || "") || null,
    season: String(formData.get("season") || "") || null,
    occasion: String(formData.get("occasion") || "") || null,
    country_of_origin: String(formData.get("country_of_origin") || "") || null,
    year_released: year ? Number(year) : null,
    perfumers: splitList(formData.get("perfumers")),
    collection: String(formData.get("collection") || "core"),
  };
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

  const payload = productPayload(formData, images, slug);

  if (id) {
    const notesEmpty =
      !payload.notes.top.length &&
      !payload.notes.heart.length &&
      !payload.notes.base.length;
    if (notesEmpty) {
      const { data: existing } = await service
        .from("products")
        .select("notes")
        .eq("id", id)
        .single();
      if (existing?.notes) payload.notes = existing.notes as typeof payload.notes;
    }
    const { error } = await service.from("products").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await service.from("products").insert(payload);
    if (error) throw new Error(error.message);
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

export async function deleteVariant(formData: FormData) {
  const { service } = await requireAdmin();
  const id = String(formData.get("id"));
  const { error } = await service.from("product_variants").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateCatalog();
}

export async function deleteBrand(formData: FormData) {
  const { service } = await requireAdmin();
  const id = String(formData.get("id"));

  const { count, error: countError } = await service
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", id);
  if (countError) throw new Error(countError.message);
  if (count && count > 0) {
    throw new Error("Remove all products for this brand before deleting it.");
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
    })
    .select("id")
    .single();
  if (insertError || !created) throw new Error(insertError?.message ?? "Insert failed");

  const variants = (product.product_variants ?? []) as {
    type: string;
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

export async function upsertVariant(formData: FormData) {
  const { service } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const compare = String(formData.get("compare_at_price_lkr") || "");
  const productId = String(formData.get("product_id"));
  const type = String(formData.get("type"));
  const sizeMl = Number(formData.get("size_ml"));
  const sku = await resolveVariantSku(service, {
    productId,
    type,
    sizeMl,
    variantId: id || undefined,
  });
  const payload = {
    product_id: productId,
    type,
    size_ml: sizeMl,
    price_lkr: Number(formData.get("price_lkr")),
    compare_at_price_lkr: compare ? Number(compare) : null,
    sku,
    is_active: formData.get("is_active") === "on",
  };

  if (id) {
    const { error } = await service
      .from("product_variants")
      .update(payload)
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await service.from("product_variants").insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidateCatalog();
  revalidatePath(`/admin/products`);
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

  const next = Math.max(0, Number(lot.remaining_ml) + delta);
  const status =
    next <= 0 ? "depleted" : lot.status === "sealed" ? "sealed" : "open";

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
  const status = String(formData.get("status"));
  const tracking = String(formData.get("tracking_number") || "") || null;
  const payload: Record<string, unknown> = { status, tracking_number: tracking };
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

  const payload: Record<string, unknown> = {
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
  const status = String(formData.get("status"));
  const admin_note = String(formData.get("admin_note") || "") || null;
  const { error } = await service
    .from("return_requests")
    .update({ status, admin_note, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
  revalidatePath("/account/returns");
}
