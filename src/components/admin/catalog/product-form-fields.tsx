import {
  AdminCheckbox,
  AdminField,
  AdminFieldGrid,
  AdminFileField,
  AdminFormSection,
  adminFieldClass,
  adminTextareaClass,
} from "@/components/admin/form/admin-form";
import { ProductVariantPackFields } from "@/components/admin/catalog/product-variant-pack";
import { CONCENTRATIONS } from "@/lib/catalog/import";

type BrandOption = { id: string; name: string };

export type ProductFormVariant = {
  id: string;
  type: string;
  size_ml: number;
  price_lkr: number;
  compare_at_price_lkr?: number | null;
};

export type ProductFormValues = {
  id?: string;
  brand_id?: string;
  name?: string;
  concentration?: string;
  collection?: string | null;
  gender?: string | null;
  description?: string | null;
  is_active?: boolean;
  notes?: { top?: string[]; heart?: string[]; base?: string[] } | null;
  perfumers?: string[] | null;
  longevity?: string | null;
  projection?: string | null;
  season?: string | null;
  occasion?: string | null;
  country_of_origin?: string | null;
  year_released?: number | null;
  inspired_by?: string | null;
  images?: string[];
};

export function ProductFormFields({
  brands,
  product,
  variants,
}: {
  brands: BrandOption[];
  product?: ProductFormValues;
  variants?: ProductFormVariant[];
}) {
  const isEdit = Boolean(product?.id);
  const notes = product?.notes ?? {};
  const perfumers = product?.perfumers ?? [];
  const images = product?.images ?? [];

  return (
    <>
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}
      <AdminFormSection>
        <AdminFieldGrid>
          <AdminField label="Brand" required>
            <select
              name="brand_id"
              required
              defaultValue={product?.brand_id ?? ""}
              className={adminFieldClass}
            >
              <option value="">Select brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label="Concentration">
            <select
              name="concentration"
              className={adminFieldClass}
              defaultValue={product?.concentration ?? "EDP"}
            >
              {CONCENTRATIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label="Name" required>
            <input
              name="name"
              required
              defaultValue={product?.name ?? ""}
              placeholder={isEdit ? undefined : "e.g. Bleu de Chanel"}
              className={adminFieldClass}
            />
          </AdminField>
          <AdminField label="Collection">
            <select
              name="collection"
              className={adminFieldClass}
              defaultValue={product?.collection ?? "core"}
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
              defaultValue={product?.gender ?? ""}
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
            defaultValue={product?.description ?? ""}
            placeholder={isEdit ? undefined : "Short product story for the storefront"}
            className={adminTextareaClass}
          />
        </AdminField>
        <AdminCheckbox
          name="is_active"
          label="Active on storefront"
          defaultChecked={product?.is_active ?? true}
        />
      </AdminFormSection>

      <AdminFormSection title="Fragrance notes & details">
        <AdminFieldGrid>
          <AdminField label="Top notes" hint="Comma-separated">
            <input
              name="notes_top"
              defaultValue={notes.top?.join(", ") ?? ""}
              className={adminFieldClass}
            />
          </AdminField>
          <AdminField label="Heart notes" hint="Comma-separated">
            <input
              name="notes_heart"
              defaultValue={notes.heart?.join(", ") ?? ""}
              className={adminFieldClass}
            />
          </AdminField>
          <AdminField label="Base notes" hint="Comma-separated">
            <input
              name="notes_base"
              defaultValue={notes.base?.join(", ") ?? ""}
              className={adminFieldClass}
            />
          </AdminField>
          <AdminField label="Perfumers" hint="Comma-separated">
            <input
              name="perfumers"
              defaultValue={perfumers.join(", ")}
              className={adminFieldClass}
            />
          </AdminField>
          <AdminField label="Longevity">
            <input
              name="longevity"
              defaultValue={product?.longevity ?? ""}
              className={adminFieldClass}
            />
          </AdminField>
          <AdminField label="Projection">
            <input
              name="projection"
              defaultValue={product?.projection ?? ""}
              className={adminFieldClass}
            />
          </AdminField>
          <AdminField label="Season">
            <input
              name="season"
              defaultValue={product?.season ?? ""}
              className={adminFieldClass}
            />
          </AdminField>
          <AdminField label="Occasion">
            <input
              name="occasion"
              defaultValue={product?.occasion ?? ""}
              className={adminFieldClass}
            />
          </AdminField>
          <AdminField label="Country of origin">
            <input
              name="country_of_origin"
              defaultValue={product?.country_of_origin ?? ""}
              className={adminFieldClass}
            />
          </AdminField>
          <AdminField label="Year released">
            <input
              name="year_released"
              type="number"
              defaultValue={product?.year_released ?? ""}
              className={adminFieldClass}
            />
          </AdminField>
          <AdminField label="Inspired by">
            <input
              name="inspired_by"
              defaultValue={product?.inspired_by ?? ""}
              className={adminFieldClass}
            />
          </AdminField>
        </AdminFieldGrid>
      </AdminFormSection>

      <ProductVariantPackFields existing={variants} />

      <AdminFormSection title="Images">
        <AdminFileField
          label={isEdit ? "Product images" : "Upload images"}
          name="image_files"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          multiple
          existing={isEdit ? images : undefined}
          existingFieldName="existing_images"
          hint="JPEG, PNG, WebP, GIF, or SVG · max 5MB each"
        />
      </AdminFormSection>
    </>
  );
}
