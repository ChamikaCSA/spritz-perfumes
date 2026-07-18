import Image from "next/image";
import { upsertBrand } from "@/actions/admin";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import {
  AdminField,
  AdminFieldGrid,
  AdminFileField,
  AdminForm,
  AdminFormSection,
  adminFieldClass,
  adminTextareaClass,
} from "@/components/admin/admin-form";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  adminButtonClass,
} from "@/components/admin/admin-shell";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils-commerce";

export const metadata = { title: "Brands · Admin" };

export default async function AdminBrandsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div>
        <AdminPageHeader
          title="Brands"
          description="Connect Supabase to manage brands."
        />
      </div>
    );
  }

  const supabase = await createClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .order("name");

  return (
    <div className="space-y-5 sm:space-y-8">
      <AdminPageHeader
        title="Brands"
        description="Logos, banners, country, and website."
        actions={
          <AdminFormDialog
            triggerLabel="Add brand"
            title="Add brand"
            description="Create a house with logo and banner assets."
            size="lg"
          >
            <AdminForm action={upsertBrand} bare>
              <AdminFormSection>
                <AdminFieldGrid>
                  <AdminField label="Name">
                    <input
                      name="name"
                      required
                      placeholder="e.g. Chanel"
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
                      placeholder="chanel"
                      className={adminFieldClass}
                    />
                  </AdminField>
                  <AdminField label="Country">
                    <input
                      name="country"
                      placeholder="France"
                      className={adminFieldClass}
                    />
                  </AdminField>
                  <AdminField label="Website">
                    <input
                      name="website"
                      type="url"
                      placeholder="https://"
                      className={adminFieldClass}
                    />
                  </AdminField>
                </AdminFieldGrid>
                <AdminField label="Description">
                  <textarea
                    name="description"
                    placeholder="Short brand story"
                    className={adminTextareaClass}
                  />
                </AdminField>
              </AdminFormSection>

              <AdminFormSection title="Assets">
                <AdminFieldGrid>
                  <AdminFileField
                    label="Logo"
                    name="logo_file"
                    accept="image/*"
                  />
                  <AdminFileField
                    label="Banner"
                    name="banner_file"
                    accept="image/*"
                  />
                </AdminFieldGrid>
              </AdminFormSection>

              <button type="submit" className={adminButtonClass}>
                Save brand
              </button>
            </AdminForm>
          </AdminFormDialog>
        }
      />

      <AdminPanel>
        {(brands ?? []).length ? (
          <ul className="divide-y divide-border/50">
            {(brands ?? []).map((brand) => (
              <li
                key={brand.id}
                className="flex items-center gap-2 px-0 py-2 sm:gap-3 sm:py-2.5"
              >
                {brand.logo_url ? (
                  <div className="relative size-9 shrink-0 overflow-hidden bg-[#f3ebe0] sm:size-10">
                    <Image
                      src={brand.logo_url}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-contain p-1"
                    />
                  </div>
                ) : (
                  <div className="flex size-9 shrink-0 items-center justify-center bg-secondary/40 text-[10px] text-muted-foreground sm:size-10">
                    —
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{brand.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {brand.slug}
                    {brand.country ? ` · ${brand.country}` : ""}
                  </p>
                </div>
                <AdminFormDialog
                  triggerLabel="Edit"
                  title={`Edit ${brand.name}`}
                  size="lg"
                  triggerVariant="link"
                  className="min-h-9 shrink-0 px-1.5 text-[11px]"
                >
                  <AdminForm action={upsertBrand} bare>
                    <input type="hidden" name="id" value={brand.id} />
                    <AdminFormSection>
                      <AdminFieldGrid>
                        <AdminField label="Name">
                          <input
                            name="name"
                            defaultValue={brand.name}
                            required
                            className={adminFieldClass}
                          />
                        </AdminField>
                        <AdminField label="Slug">
                          <input
                            name="slug"
                            defaultValue={brand.slug}
                            required
                            className={adminFieldClass}
                          />
                        </AdminField>
                        <AdminField label="Country">
                          <input
                            name="country"
                            defaultValue={brand.country ?? ""}
                            className={adminFieldClass}
                          />
                        </AdminField>
                        <AdminField label="Website">
                          <input
                            name="website"
                            defaultValue={brand.website ?? ""}
                            className={adminFieldClass}
                          />
                        </AdminField>
                      </AdminFieldGrid>
                      <AdminField label="Description">
                        <textarea
                          name="description"
                          defaultValue={brand.description ?? ""}
                          className={adminTextareaClass}
                        />
                      </AdminField>
                      <AdminFieldGrid>
                        <AdminFileField
                          label="Replace logo"
                          name="logo_file"
                          accept="image/*"
                        />
                        <AdminFileField
                          label="Replace banner"
                          name="banner_file"
                          accept="image/*"
                        />
                      </AdminFieldGrid>
                    </AdminFormSection>
                    <button type="submit" className={adminButtonClass}>
                      Update brand
                    </button>
                  </AdminForm>
                </AdminFormDialog>
              </li>
            ))}
          </ul>
        ) : (
          <AdminEmpty>No brands yet</AdminEmpty>
        )}
      </AdminPanel>
    </div>
  );
}
