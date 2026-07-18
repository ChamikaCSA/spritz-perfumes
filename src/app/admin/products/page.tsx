import Image from "next/image";
import {
  appendProductImages,
  deleteProduct,
  duplicateProduct,
  importProductsCsv,
  upsertProduct,
  upsertVariant,
} from "@/actions/admin";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import {
  AdminCheckbox,
  AdminField,
  AdminFieldGrid,
  AdminFileField,
  AdminForm,
  AdminFormSection,
  AdminMoreFields,
  adminFieldClass,
  adminTextareaClass,
} from "@/components/admin/admin-form";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  adminButtonClass,
  adminGhostButtonClass,
} from "@/components/admin/admin-shell";
import { AdminStatus } from "@/components/admin/admin-status";
import { DEMO_PRODUCTS } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";
import { formatLkr, isSupabaseConfigured } from "@/lib/utils-commerce";
import { cn } from "@/lib/utils";

export const metadata = { title: "Products · Admin" };

const concentrations = ["EDT", "EDP", "Parfum", "Extrait", "EDC", "Other"];

export default async function AdminProductsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="space-y-5 sm:space-y-8">
        <AdminPageHeader
          title="Products"
          description={`Demo catalog (${DEMO_PRODUCTS.length} products). Connect Supabase for CRUD.`}
        />
        <ul className="divide-y divide-border/50">
          {DEMO_PRODUCTS.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-2 px-0 py-2 text-sm sm:py-2.5"
            >
              <span>
                {p.brand?.name} · {p.name}
              </span>
              <span className="text-muted-foreground">
                {p.variants?.length ?? 0} variants
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const supabase = await createClient();
  const [{ data: brands }, { data: products }] = await Promise.all([
    supabase.from("brands").select("*").order("name"),
    supabase
      .from("products")
      .select("*, brands(name), product_variants(*)")
      .order("name"),
  ]);

  return (
    <div className="space-y-5 sm:space-y-8">
      <AdminPageHeader
        title="Products"
        description="Manage fragrances, notes, and bottle / decant variants."
        actions={
          <div className="flex flex-wrap gap-2">
            <AdminFormDialog
              triggerLabel="Add product"
              title="Add product"
              description="Create a fragrance with storefront details."
              size="xl"
            >
              <AdminForm action={upsertProduct} bare>
                <AdminFormSection>
                  <AdminFieldGrid>
                    <AdminField label="Brand">
                      <select
                        name="brand_id"
                        required
                        className={adminFieldClass}
                      >
                        <option value="">Select brand</option>
                        {(brands ?? []).map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </AdminField>
                    <AdminField label="Concentration">
                      <select
                        name="concentration"
                        className={adminFieldClass}
                        defaultValue="EDP"
                      >
                        {concentrations.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </AdminField>
                    <AdminField label="Name">
                      <input
                        name="name"
                        required
                        placeholder="e.g. Bleu de Chanel"
                        className={adminFieldClass}
                      />
                    </AdminField>
                    <AdminField
                      label="Slug"
                      hint="URL path — lowercase, hyphens only"
                    >
                      <input
                        name="slug"
                        required
                        placeholder="bleu-de-chanel"
                        className={adminFieldClass}
                      />
                    </AdminField>
                    <AdminField label="Collection">
                      <select
                        name="collection"
                        className={adminFieldClass}
                        defaultValue="core"
                      >
                        <option value="core">Core</option>
                        <option value="gift_set">Gift set</option>
                        <option value="new">New</option>
                        <option value="sale">Sale</option>
                        <option value="limited">Limited</option>
                      </select>
                    </AdminField>
                    <AdminField label="Gender">
                      <select
                        name="gender"
                        className={adminFieldClass}
                        defaultValue=""
                      >
                        <option value="">Not set</option>
                        <option value="women">Women</option>
                        <option value="men">Men</option>
                        <option value="unisex">Unisex</option>
                      </select>
                    </AdminField>
                  </AdminFieldGrid>
                  <AdminField label="Description">
                    <textarea
                      name="description"
                      placeholder="Short product story for the storefront"
                      className={adminTextareaClass}
                    />
                  </AdminField>
                  <AdminCheckbox
                    name="is_active"
                    label="Active on storefront"
                    defaultChecked
                  />
                </AdminFormSection>

                <AdminMoreFields label="Scent notes & details (optional)">
                  <AdminFieldGrid>
                    <AdminField label="Top notes" hint="Comma-separated">
                      <input name="notes_top" className={adminFieldClass} />
                    </AdminField>
                    <AdminField label="Heart notes" hint="Comma-separated">
                      <input name="notes_heart" className={adminFieldClass} />
                    </AdminField>
                    <AdminField label="Base notes" hint="Comma-separated">
                      <input name="notes_base" className={adminFieldClass} />
                    </AdminField>
                    <AdminField label="Perfumers" hint="Comma-separated">
                      <input name="perfumers" className={adminFieldClass} />
                    </AdminField>
                    <AdminField label="Longevity">
                      <input name="longevity" className={adminFieldClass} />
                    </AdminField>
                    <AdminField label="Projection">
                      <input name="projection" className={adminFieldClass} />
                    </AdminField>
                    <AdminField label="Season">
                      <input name="season" className={adminFieldClass} />
                    </AdminField>
                    <AdminField label="Occasion">
                      <input name="occasion" className={adminFieldClass} />
                    </AdminField>
                    <AdminField label="Country of origin">
                      <input
                        name="country_of_origin"
                        className={adminFieldClass}
                      />
                    </AdminField>
                    <AdminField label="Year released">
                      <input
                        name="year_released"
                        type="number"
                        className={adminFieldClass}
                      />
                    </AdminField>
                  </AdminFieldGrid>
                </AdminMoreFields>

                <AdminFormSection title="Images">
                  <AdminFileField
                    label="Upload images"
                    name="image_files"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    multiple
                    hint="JPEG, PNG, WebP, GIF, or SVG · max 5MB each"
                  />
                  <AdminField
                    label="Or paste image URLs"
                    hint="Comma-separated — useful for placeholders"
                  >
                    <input name="images" className={adminFieldClass} />
                  </AdminField>
                </AdminFormSection>

                <button type="submit" className={adminButtonClass}>
                  Save product
                </button>
              </AdminForm>
            </AdminFormDialog>

            <AdminFormDialog
              triggerLabel="Import CSV"
              title="Import CSV"
              description="Bulk create products from a spreadsheet."
              size="md"
            >
              <AdminForm action={importProductsCsv} bare>
                <AdminFileField
                  label="CSV file"
                  name="csv"
                  accept=".csv,text/csv"
                  required
                  hint="Headers: brand_slug, name, slug, concentration, description, collection, notes_top, notes_heart, notes_base, is_active"
                />
                <div className="flex flex-wrap gap-2">
                  <button type="submit" className={adminButtonClass}>
                    Import CSV
                  </button>
                  <a
                    href="/api/admin/products-export"
                    className={adminGhostButtonClass}
                  >
                    Export CSV
                  </a>
                </div>
              </AdminForm>
            </AdminFormDialog>

            <AdminFormDialog
              triggerLabel="Add variant"
              title="Add variant"
              description="Full size or decant pricing for a product."
              size="lg"
            >
              <AdminForm action={upsertVariant} bare>
                <AdminFieldGrid cols={3}>
                  <AdminField
                    label="Product"
                    className="sm:col-span-2 lg:col-span-1"
                  >
                    <select
                      name="product_id"
                      required
                      className={adminFieldClass}
                    >
                      <option value="">Select product</option>
                      {(products ?? []).map((p) => (
                        <option key={p.id} value={p.id}>
                          {(p.brands as { name: string } | null)?.name} ·{" "}
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </AdminField>
                  <AdminField label="Type">
                    <select
                      name="type"
                      className={adminFieldClass}
                      defaultValue="decant"
                    >
                      <option value="full_size">Full size</option>
                      <option value="decant">Decant</option>
                    </select>
                  </AdminField>
                  <AdminField label="Size (ml)">
                    <input
                      name="size_ml"
                      type="number"
                      required
                      className={adminFieldClass}
                    />
                  </AdminField>
                  <AdminField label="Price (LKR)">
                    <input
                      name="price_lkr"
                      type="number"
                      required
                      className={adminFieldClass}
                    />
                  </AdminField>
                  <AdminField label="SKU">
                    <input name="sku" required className={adminFieldClass} />
                  </AdminField>
                  <AdminField
                    label="Compare-at (LKR)"
                    hint="Optional sale strikethrough"
                  >
                    <input
                      name="compare_at_price_lkr"
                      type="number"
                      className={adminFieldClass}
                    />
                  </AdminField>
                </AdminFieldGrid>
                <AdminCheckbox
                  name="is_active"
                  label="Active on storefront"
                  defaultChecked
                />
                <button type="submit" className={adminButtonClass}>
                  Save variant
                </button>
              </AdminForm>
            </AdminFormDialog>
          </div>
        }
      />

      <AdminPanel>
        {(products ?? []).length ? (
          <ul className="divide-y divide-border/50">
            {(products ?? []).map((product) => {
              const brand = product.brands as { name: string } | null;
              const variants = (product.product_variants ?? []) as {
                id: string;
                type: string;
                size_ml: number;
                price_lkr: number;
                sku: string;
              }[];
              const images = (product.images as string[] | null) ?? [];
              return (
                <li
                  key={product.id}
                  className="flex items-center gap-2 px-0 py-2 sm:gap-3 sm:py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      <span className="text-muted-foreground">
                        {brand?.name}
                      </span>
                      <span className="mx-1.5 text-border">·</span>
                      {product.name}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                      <span className="tabular-nums">
                        {variants.length} variants
                      </span>
                      <AdminStatus tone={product.is_active ? "ok" : "muted"}>
                        {product.is_active ? "Active" : "Hidden"}
                      </AdminStatus>
                    </div>
                  </div>
                  <AdminFormDialog
                    triggerLabel="Edit"
                    title={product.name}
                    description={`${brand?.name ?? "Brand"} · ${product.slug}`}
                    size="xl"
                    triggerVariant="link"
                    className="min-h-9 shrink-0 px-1.5 text-[11px]"
                  >
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-2">
                        <form action={duplicateProduct}>
                          <input type="hidden" name="id" value={product.id} />
                          <button
                            type="submit"
                            className={cn(
                              adminGhostButtonClass,
                              "h-9 px-3 text-[10px]",
                            )}
                          >
                            Duplicate
                          </button>
                        </form>
                        <form action={deleteProduct}>
                          <input type="hidden" name="id" value={product.id} />
                          <button
                            type="submit"
                            className={cn(
                              adminGhostButtonClass,
                              "h-9 px-3 text-[10px]",
                            )}
                          >
                            Hide
                          </button>
                        </form>
                      </div>

                      <AdminForm action={upsertProduct} bare>
                        <input type="hidden" name="id" value={product.id} />
                        <input
                          type="hidden"
                          name="brand_id"
                          value={product.brand_id}
                        />
                        <AdminFormSection>
                          <AdminFieldGrid>
                            <AdminField label="Name">
                              <input
                                name="name"
                                defaultValue={product.name}
                                required
                                className={adminFieldClass}
                              />
                            </AdminField>
                            <AdminField label="Slug">
                              <input
                                name="slug"
                                defaultValue={product.slug}
                                required
                                className={adminFieldClass}
                              />
                            </AdminField>
                            <AdminField label="Concentration">
                              <select
                                name="concentration"
                                defaultValue={product.concentration}
                                className={adminFieldClass}
                              >
                                {concentrations.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </AdminField>
                            <AdminField label="Collection">
                              <select
                                name="collection"
                                defaultValue={product.collection ?? "core"}
                                className={adminFieldClass}
                              >
                                <option value="core">Core</option>
                                <option value="gift_set">Gift set</option>
                                <option value="new">New</option>
                                <option value="sale">Sale</option>
                                <option value="limited">Limited</option>
                              </select>
                            </AdminField>
                          </AdminFieldGrid>
                          <AdminField label="Description">
                            <textarea
                              name="description"
                              defaultValue={product.description ?? ""}
                              className={adminTextareaClass}
                            />
                          </AdminField>
                          <AdminFieldGrid>
                            <AdminField label="Longevity">
                              <input
                                name="longevity"
                                defaultValue={product.longevity ?? ""}
                                className={adminFieldClass}
                              />
                            </AdminField>
                            <AdminField label="Projection">
                              <input
                                name="projection"
                                defaultValue={product.projection ?? ""}
                                className={adminFieldClass}
                              />
                            </AdminField>
                          </AdminFieldGrid>
                          <AdminCheckbox
                            name="is_active"
                            label="Active on storefront"
                            defaultChecked={product.is_active}
                          />
                        </AdminFormSection>
                        <button type="submit" className={adminButtonClass}>
                          Save edits
                        </button>
                      </AdminForm>

                      <div className="space-y-3 border-t border-border/40 pt-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-amber">
                          Variants
                        </p>
                        {variants.length ? (
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            {variants.map((v) => (
                              <li
                                key={v.id}
                                className="flex flex-wrap justify-between gap-2 border border-border/30 px-3 py-2"
                              >
                                <span>
                                  {v.type === "full_size"
                                    ? "Full size"
                                    : "Decant"}{" "}
                                  · {v.size_ml} ml · {v.sku}
                                </span>
                                <span className="tabular-nums text-foreground">
                                  {formatLkr(Number(v.price_lkr))}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No variants yet — use Add variant.
                          </p>
                        )}
                      </div>

                      <div className="space-y-3 border-t border-border/40 pt-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-amber">
                          Images
                        </p>
                        {images.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {images.map((src) => (
                              <div
                                key={src}
                                className="relative size-16 overflow-hidden bg-muted"
                              >
                                <Image
                                  src={src}
                                  alt=""
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        ) : null}
                        <AdminForm action={appendProductImages} bare>
                          <input
                            type="hidden"
                            name="product_id"
                            value={product.id}
                          />
                          <input
                            type="hidden"
                            name="slug"
                            value={product.slug}
                          />
                          <AdminFileField
                            label="Add images"
                            name="image_files"
                            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                            multiple
                            required
                          />
                          <button type="submit" className={adminGhostButtonClass}>
                            Upload
                          </button>
                        </AdminForm>
                      </div>
                    </div>
                  </AdminFormDialog>
                </li>
              );
            })}
          </ul>
        ) : (
          <AdminEmpty>No products yet</AdminEmpty>
        )}
      </AdminPanel>
    </div>
  );
}
