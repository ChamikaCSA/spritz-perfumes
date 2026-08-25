import { deleteProduct, upsertProduct } from "@/actions/admin";
import { AdminFormDialog } from "@/components/admin/form/admin-form-dialog";
import { AdminDeleteForm } from "@/components/admin/form/admin-delete-form";
import { CatalogCsvImport } from "@/components/admin/catalog/catalog-csv-import";
import { ProductFormFields } from "@/components/admin/catalog/product-form-fields";
import { AdminForm } from "@/components/admin/form/admin-form";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  adminButtonClass,
} from "@/components/admin/layout/admin-shell";
import { AdminStatus } from "@/components/admin/layout/admin-status";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { getAdminProductsPage } from "@/lib/catalog";
import { DEMO_PRODUCTS } from "@/lib/catalog/demo";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { isDemoMode } from "@/lib/supabase/env";

export const metadata = { title: "Products · Admin" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if (isDemoMode()) {
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

  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);
  const { result, brandOptions } = await getAdminProductsPage(page, PAGE_SIZE.admin);

  return (
    <div className="space-y-5 sm:space-y-8">
      <AdminPageHeader
        title="Products"
        description="Manage fragrances, notes, and bottle / decant variants."
        actions={
          <div className="flex flex-wrap gap-2">
            <AdminFormDialog
              triggerLabel="Import CSV"
              title="Import catalog"
              description="Create or update products and variants from a spreadsheet."
              size="lg"
            >
              <CatalogCsvImport />
            </AdminFormDialog>
            <AdminFormDialog
              triggerLabel="Add product"
              title="Add product"
              description="Create a fragrance with storefront details."
              size="xl"
            >
              <AdminForm action={upsertProduct} bare>
                <ProductFormFields brands={brandOptions} />
                <button type="submit" className={adminButtonClass}>
                  Save product
                </button>
              </AdminForm>
            </AdminFormDialog>
          </div>
        }
      />

      <AdminPanel>
        {result.items.length ? (
          <ul id="results" className="scroll-mt-20 divide-y divide-border/50">
            {result.items.map((product) => {
              const brand = product.brands as { name: string } | null;
              const variants = (product.product_variants ?? []) as {
                id: string;
                type: string;
                size_ml: number;
                price_lkr: number;
                compare_at_price_lkr: number | null;
                is_active: boolean;
              }[];
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
                  >
                    <div className="space-y-6">
                      <AdminForm action={upsertProduct} bare>
                        <ProductFormFields
                          brands={brandOptions}
                          product={{
                            id: product.id,
                            brand_id: product.brand_id,
                            name: product.name,
                            concentration: product.concentration,
                            collection: product.collection,
                            gender: product.gender,
                            description: product.description,
                            is_active: product.is_active,
                            notes: product.notes as {
                              top?: string[];
                              heart?: string[];
                              base?: string[];
                            } | null,
                            perfumers: (product.perfumers as string[] | null) ?? [],
                            longevity: product.longevity,
                            projection: product.projection,
                            season: product.season,
                            occasion: product.occasion,
                            country_of_origin: product.country_of_origin,
                            year_released: product.year_released,
                            inspired_by: product.inspired_by,
                            images: (product.images as string[] | null) ?? [],
                          }}
                          variants={variants}
                        />
                        <button type="submit" className={adminButtonClass}>
                          Update product
                        </button>
                      </AdminForm>
                      <AdminDeleteForm
                        action={deleteProduct}
                        id={product.id}
                        label="Delete product"
                        name={product.name}
                        description="Variants and inventory go with it."
                      />
                    </div>
                  </AdminFormDialog>
                </li>
              );
            })}
          </ul>
        ) : (
          <AdminEmpty>No products yet</AdminEmpty>
        )}
        <PaginationNav
          page={result.page}
          pageCount={result.pageCount}
          total={result.total}
          pageSize={result.pageSize}
          pathname="/admin/products"
          compact
        />
      </AdminPanel>
    </div>
  );
}
