import { adjustInventory, receiveInventory } from "@/actions/admin";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import {
  AdminField,
  AdminFieldGrid,
  AdminForm,
  AdminFormSection,
  adminFieldClass,
} from "@/components/admin/admin-form";
import {
  OpenLotButton,
  ResealLotButton,
} from "@/components/admin/open-lot-button";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  AdminActions,
  adminButtonClass,
  adminGhostButtonClass,
} from "@/components/admin/admin-shell";
import { AdminStatus, lotStatusTone } from "@/components/admin/admin-status";
import { PaginationNav } from "@/components/store/pagination-nav";
import { PAGE_SIZE, pageFromTotal, pageRange, parsePage } from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils-commerce";
import { cn } from "@/lib/utils";

export const metadata = { title: "Inventory · Admin" };

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; events?: string }>;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div>
        <AdminPageHeader
          title="Inventory"
          description="Connect Supabase to receive sealed lots and open bottles for decanting."
        />
      </div>
    );
  }

  const params = await searchParams;
  const lotsPage = parsePage(params.page);
  const eventsPage = parsePage(params.events);
  const lotsRange = pageRange(lotsPage, PAGE_SIZE.admin);
  const eventsRange = pageRange(eventsPage, PAGE_SIZE.inventoryEvents);
  const supabase = await createClient();
  const [
    { data: products },
    { data: lots, count: lotsCount },
    { data: events, count: eventsCount },
  ] = await Promise.all([
    supabase.from("products").select("id, name, brands(name)").order("name"),
    supabase
      .from("inventory_lots")
      .select("*, products(name, brands(name))", { count: "exact" })
      .order("received_at", { ascending: false })
      .range(lotsRange.from, lotsRange.to),
    supabase
      .from("inventory_events")
      .select("*, products(name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(eventsRange.from, eventsRange.to),
  ]);
  const lotsResult = pageFromTotal(
    lots ?? [],
    lotsCount ?? 0,
    lotsPage,
    PAGE_SIZE.admin,
  );
  const eventsResult = pageFromTotal(
    events ?? [],
    eventsCount ?? 0,
    eventsPage,
    PAGE_SIZE.inventoryEvents,
  );

  return (
    <div className="space-y-5 sm:space-y-8">
      <AdminPageHeader
        title="Inventory"
        description="Receive wholesale bottles, then open sealed stock for decant sales."
        actions={
          <AdminFormDialog
            triggerLabel="Receive stock"
            title="Receive stock"
            description="Adds sealed bottles ready to open for decants."
            size="md"
          >
            <AdminForm action={receiveInventory} bare>
              <AdminFormSection>
                <AdminField label="Product" required>
                  <select
                    name="product_id"
                    required
                    className={adminFieldClass}
                  >
                    <option value="">Select product</option>
                    {(products ?? []).map((p) => {
                      const brand =
                        p.brands as
                          | { name: string }
                          | { name: string }[]
                          | null;
                      const brandName = Array.isArray(brand)
                        ? brand[0]?.name
                        : brand?.name;
                      return (
                        <option key={p.id} value={p.id}>
                          {brandName} · {p.name}
                        </option>
                      );
                    })}
                  </select>
                </AdminField>
                <AdminFieldGrid>
                  <AdminField
                    label="Fill (ml)"
                    hint="Bottle capacity, e.g. 100"
                    required
                  >
                    <input
                      name="fill_ml"
                      type="number"
                      required
                      placeholder="100"
                      className={adminFieldClass}
                    />
                  </AdminField>
                  <AdminField label="Quantity">
                    <input
                      name="quantity"
                      type="number"
                      defaultValue={1}
                      min={1}
                      className={adminFieldClass}
                    />
                  </AdminField>
                  <AdminField label="Cost (LKR)">
                    <input
                      name="cost_lkr"
                      type="number"
                      className={adminFieldClass}
                    />
                  </AdminField>
                  <AdminField label="Notes">
                    <input name="notes" className={adminFieldClass} />
                  </AdminField>
                </AdminFieldGrid>
              </AdminFormSection>
              <button type="submit" className={adminButtonClass}>
                Receive stock
              </button>
            </AdminForm>
          </AdminFormDialog>
        }
      />

      <AdminPanel>
        {lotsResult.items.length ? (
          <ul id="lots-results" className="scroll-mt-20 divide-y divide-border/50">
            {lotsResult.items.map((lot) => {
              const product = lot.products as {
                name: string;
                brands: { name: string } | { name: string }[];
              } | null;
              const brand = product?.brands;
              const brandName = Array.isArray(brand)
                ? brand[0]?.name
                : brand?.name;
              return (
                <li
                  key={lot.id}
                  className="flex items-center gap-2 px-0 py-2 sm:gap-3 sm:py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {brandName} · {product?.name}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                      <AdminStatus tone={lotStatusTone(lot.status)}>
                        {lot.status}
                      </AdminStatus>
                      <span>
                        {lot.fill_ml} ml · {lot.remaining_ml} left
                      </span>
                    </div>
                  </div>
                  <AdminActions>
                    {lot.status === "sealed" ? (
                      <OpenLotButton lotId={lot.id} />
                    ) : null}
                    {lot.status === "open" &&
                    Number(lot.remaining_ml) === Number(lot.fill_ml) ? (
                      <ResealLotButton lotId={lot.id} />
                    ) : null}
                    {lot.status === "open" ? (
                      <AdminFormDialog
                        triggerLabel="Adjust"
                        title="Adjust stock"
                        description={`${brandName} · ${product?.name}`}
                        size="md"
                        triggerVariant="link"
                      >
                        <AdminForm action={adjustInventory} bare>
                          <input type="hidden" name="lot_id" value={lot.id} />
                          <AdminFieldGrid>
                            <AdminField label="Kind">
                              <select
                                name="kind"
                                className={adminFieldClass}
                                defaultValue="adjust"
                              >
                                <option value="adjust">Adjust</option>
                                <option value="loss">Loss</option>
                                <option value="sample">Sample</option>
                              </select>
                            </AdminField>
                            <AdminField
                              label="Change (ml)"
                              hint="Negative to reduce"
                              required
                            >
                              <input
                                name="delta_ml"
                                type="number"
                                step="0.1"
                                required
                                className={adminFieldClass}
                              />
                            </AdminField>
                          </AdminFieldGrid>
                          <AdminField label="Note">
                            <input name="note" className={adminFieldClass} />
                          </AdminField>
                          <button
                            type="submit"
                            className={cn(adminGhostButtonClass)}
                          >
                            Apply adjustment
                          </button>
                        </AdminForm>
                      </AdminFormDialog>
                    ) : null}
                  </AdminActions>
                </li>
              );
            })}
          </ul>
        ) : (
          <AdminEmpty>No lots yet</AdminEmpty>
        )}
        <PaginationNav
          page={lotsResult.page}
          pageCount={lotsResult.pageCount}
          total={lotsResult.total}
          pageSize={lotsResult.pageSize}
          pathname="/admin/inventory"
          query={{ events: eventsPage > 1 ? String(eventsPage) : undefined }}
          resultsId="lots-results"
          compact
        />
      </AdminPanel>

      <AdminPanel title="History">
        {eventsResult.items.length ? (
          <ul
            id="event-results"
            className="scroll-mt-20 divide-y divide-border/40 text-sm text-muted-foreground"
          >
            {eventsResult.items.map((event) => {
              const product = event.products as { name: string } | null;
              return (
                <li
                  key={event.id}
                  className="flex items-center justify-between gap-2 py-2 sm:py-2.5"
                >
                  <span className="min-w-0 truncate">
                    <span className="uppercase tracking-[0.14em] text-amber">
                      {event.kind}
                    </span>{" "}
                    · {product?.name ?? "Product"} · {event.delta_ml} ml
                    {event.note ? ` · ${event.note}` : ""}
                  </span>
                  <span className="shrink-0 text-[11px] tabular-nums">
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <AdminEmpty>No events yet</AdminEmpty>
        )}
        <PaginationNav
          page={eventsResult.page}
          pageCount={eventsResult.pageCount}
          total={eventsResult.total}
          pageSize={eventsResult.pageSize}
          pathname="/admin/inventory"
          query={{ page: lotsPage > 1 ? String(lotsPage) : undefined }}
          pageKey="events"
          resultsId="event-results"
          compact
        />
      </AdminPanel>
    </div>
  );
}
