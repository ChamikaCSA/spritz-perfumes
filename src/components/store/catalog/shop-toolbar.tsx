"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Search,
  X,
} from "lucide-react";
import { CatalogStyleToggle } from "@/components/store/catalog/catalog-style";
import { ShopFilterSheet } from "@/components/store/catalog/shop-filters";
import {
  EMPTY_FILTER_DRAFT,
  FORMATS,
  SORTS,
  advancedFilterCount,
  buildShopUrl,
  shopFilterDraft,
  type ShopQuery,
} from "@/components/store/catalog/shop-query";
import { defaultSortOrder } from "@/lib/catalog/sort";
import { cn } from "@/lib/utils";
import type { ProductSort, ProductSortOrder } from "@/types";

export type { ShopQuery };

export function ShopToolbar({
  params,
  resultCount,
  page,
  pageSize,
}: {
  params: ShopQuery;
  resultCount: number;
  page?: number;
  pageSize?: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(shopFilterDraft(params));
  const extra = advancedFilterCount(params);

  function navigate(updates: Partial<ShopQuery>) {
    router.push(buildShopUrl({ ...params, ...updates }));
  }

  function applySheet() {
    navigate({
      concentration: draft.concentration || undefined,
      gender: draft.gender || undefined,
      size_ml: draft.size_ml || undefined,
      available: draft.available || undefined,
      min_price: draft.min_price || undefined,
      max_price: draft.max_price || undefined,
      note: draft.note || undefined,
    });
    setOpen(false);
  }

  function clearSheet() {
    setDraft(EMPTY_FILTER_DRAFT);
    navigate({
      concentration: undefined,
      gender: undefined,
      size_ml: undefined,
      available: undefined,
      min_price: undefined,
      max_price: undefined,
      note: undefined,
      brand: undefined,
    });
    setOpen(false);
  }

  const activePills: { key: keyof ShopQuery; label: string }[] = [];
  if (params.q) activePills.push({ key: "q", label: `“${params.q}”` });
  if (params.brand)
    activePills.push({ key: "brand", label: `Brand: ${params.brand}` });
  if (params.concentration)
    activePills.push({ key: "concentration", label: params.concentration });
  if (params.gender) activePills.push({ key: "gender", label: params.gender });
  if (params.size_ml)
    activePills.push({ key: "size_ml", label: `${params.size_ml} ml` });
  if (params.available)
    activePills.push({ key: "available", label: "In stock" });
  if (params.min_price || params.max_price) {
    activePills.push({
      key: "min_price",
      label: `LKR ${params.min_price || "0"}–${params.max_price || "∞"}`,
    });
  }
  if (params.note)
    activePills.push({ key: "note", label: `Note: ${params.note}` });

  const sortBy = (params.sort as ProductSort | undefined) ?? "name";
  const sortOrder =
    (params.order as ProductSortOrder | undefined) ?? defaultSortOrder(sortBy);
  const nextOrder: ProductSortOrder = sortOrder === "asc" ? "desc" : "asc";

  return (
    <div className="mb-10 space-y-4">
      <form
        action="/shop"
        method="get"
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          navigate({ q: String(fd.get("q") || "") || undefined });
        }}
      >
        {(
          [
            "type",
            "sort",
            "order",
            "concentration",
            "gender",
            "size_ml",
            "available",
            "brand",
            "min_price",
            "max_price",
            "note",
          ] as const
        ).map((key) =>
          params[key] ? (
            <input key={key} type="hidden" name={key} value={params[key]} />
          ) : null,
        )}
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search fragrance…"
            className="h-11 w-full border border-border bg-secondary/30 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-amber/40"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center bg-amber text-primary-foreground sm:w-auto sm:px-5 sm:text-xs sm:uppercase sm:tracking-[0.16em]"
          aria-label="Search"
        >
          <Search className="size-4 sm:hidden" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Format"
          className="flex w-full border border-border sm:inline-flex sm:w-fit"
        >
          {FORMATS.map((f) => {
            const active = (params.type ?? undefined) === f.value;
            return (
              <button
                key={f.label}
                type="button"
                onClick={() => navigate({ type: f.value })}
                className={cn(
                  "min-h-11 flex-1 px-2.5 py-2 text-[11px] uppercase tracking-[0.14em] transition sm:flex-none sm:px-4",
                  active
                    ? "bg-amber/15 text-amber"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex min-w-0 flex-1 sm:flex-none">
            <span className="sr-only">Sort</span>
            <select
              value={(params.sort as ProductSort | undefined) ?? "name"}
              onChange={(e) => {
                const sort = e.target.value as ProductSort;
                navigate({
                  sort: sort === "name" ? undefined : sort,
                  order: undefined,
                });
              }}
              className="h-11 min-w-0 flex-1 border border-border bg-secondary/30 px-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-amber/40 sm:h-9 sm:min-w-28 sm:flex-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            aria-label={
              sortOrder === "asc"
                ? "Sorted ascending — click for descending"
                : "Sorted descending — click for ascending"
            }
            title={
              sortOrder === "asc" ? "Sorted ascending" : "Sorted descending"
            }
            onClick={() =>
              navigate({
                order:
                  nextOrder === defaultSortOrder(sortBy)
                    ? undefined
                    : nextOrder,
              })
            }
            className="inline-flex size-11 items-center justify-center border border-border text-muted-foreground transition hover:text-foreground sm:size-9"
          >
            {sortOrder === "asc" ? (
              <ArrowUpNarrowWide className="size-4" aria-hidden />
            ) : (
              <ArrowDownNarrowWide className="size-4" aria-hidden />
            )}
          </button>

          <CatalogStyleToggle />

          <ShopFilterSheet
            open={open}
            extra={extra}
            params={params}
            draft={draft}
            onOpenChange={(next) => {
              setOpen(next);
              if (next) setDraft(shopFilterDraft(params));
            }}
            onDraftChange={(update) =>
              setDraft((d) => ({ ...d, ...update }))
            }
            onClear={clearSheet}
            onApply={applySheet}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/40 pt-4">
        <p className="text-xs tabular-nums text-muted-foreground">
          {page && pageSize && resultCount > 0
            ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, resultCount)} of ${resultCount} ${resultCount === 1 ? "fragrance" : "fragrances"}`
            : `${resultCount} ${resultCount === 1 ? "fragrance" : "fragrances"}`}
        </p>
        {activePills.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {activePills.map((pill) => (
              <button
                key={`${pill.key}-${pill.label}`}
                type="button"
                onClick={() => {
                  if (pill.key === "min_price") {
                    navigate({ min_price: undefined, max_price: undefined });
                  } else {
                    navigate({ [pill.key]: undefined });
                  }
                }}
                className="inline-flex items-center gap-1.5 border border-amber/30 bg-amber/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-amber"
              >
                {pill.label}
                <X className="size-3 opacity-70" />
              </button>
            ))}
            <Link
              href="/shop"
              className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-amber"
            >
              Reset
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
