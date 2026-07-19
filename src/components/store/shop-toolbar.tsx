"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { ProductGender, ProductSort, ProductSortOrder } from "@/lib/types";
import { defaultSortOrder } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ShopQuery = {
  brand?: string;
  concentration?: string;
  type?: string;
  q?: string;
  gender?: string;
  note?: string;
  size_ml?: string;
  min_price?: string;
  max_price?: string;
  available?: string;
  sort?: string;
  order?: string;
};

const CONCENTRATIONS = ["EDT", "EDP", "Parfum", "Extrait", "EDC"];
const GENDERS: ProductGender[] = ["women", "men", "unisex"];
const SIZES = ["2", "5", "10", "50", "100"];
const SORTS: { value: ProductSort; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "newest", label: "Newest" },
  { value: "price", label: "Price" },
  { value: "popularity", label: "Popular" },
  { value: "rating", label: "Rating" },
];

const FORMATS = [
  { value: undefined, label: "All" },
  { value: "full_size", label: "Full size" },
  { value: "decant", label: "Decants" },
] as const;

function buildUrl(params: ShopQuery) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) sp.set(k, v);
  });
  const qs = sp.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

function advancedCount(params: ShopQuery) {
  return [
    params.concentration,
    params.gender,
    params.size_ml,
    params.min_price,
    params.max_price,
    params.note,
    params.available,
    params.brand,
  ].filter(Boolean).length;
}

export function ShopToolbar({
  params,
  resultCount,
}: {
  params: ShopQuery;
  resultCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    concentration: params.concentration ?? "",
    gender: params.gender ?? "",
    size_ml: params.size_ml ?? "",
    available: params.available ?? "",
    min_price: params.min_price ?? "",
    max_price: params.max_price ?? "",
    note: params.note ?? "",
  });
  const extra = advancedCount(params);

  function navigate(updates: Partial<ShopQuery>) {
    router.push(buildUrl({ ...params, ...updates }));
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
    setDraft({
      concentration: "",
      gender: "",
      size_ml: "",
      available: "",
      min_price: "",
      max_price: "",
      note: "",
    });
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
      {/* Search */}
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

      {/* Format · Sort · Filters */}
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
          <label className="flex min-w-0 flex-1 items-center gap-2 text-xs text-muted-foreground sm:flex-none">
            <span className="shrink-0 uppercase tracking-[0.14em]">Sort</span>
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

          <Sheet
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (next) {
                setDraft({
                  concentration: params.concentration ?? "",
                  gender: params.gender ?? "",
                  size_ml: params.size_ml ?? "",
                  available: params.available ?? "",
                  min_price: params.min_price ?? "",
                  max_price: params.max_price ?? "",
                  note: params.note ?? "",
                });
              }
            }}
          >
            <SheetTrigger
              render={
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-11 items-center gap-2 border px-3 text-[11px] uppercase tracking-[0.14em] transition sm:h-9",
                    extra > 0
                      ? "border-amber/50 text-amber"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                />
              }
            >
              <SlidersHorizontal className="size-3.5" />
              Filters
              {extra > 0 ? (
                <span className="flex size-4 items-center justify-center rounded-full bg-amber text-[10px] font-medium text-primary-foreground">
                  {extra}
                </span>
              ) : null}
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full border-border bg-background sm:max-w-md"
            >
              <SheetHeader>
                <SheetTitle className="font-display text-2xl">
                  Filters
                </SheetTitle>
                <SheetDescription>
                  Narrow by collection, notes, size, and more.
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-2">
                {params.brand ? (
                  <p className="text-sm text-muted-foreground">
                    Brand: <span className="text-amber">{params.brand}</span>
                  </p>
                ) : null}

                <Field label="Concentration">
                  <ChipSelect
                    value={draft.concentration}
                    onChange={(v) =>
                      setDraft((d) => ({ ...d, concentration: v }))
                    }
                    options={[
                      { value: "", label: "All" },
                      ...CONCENTRATIONS.map((c) => ({ value: c, label: c })),
                    ]}
                  />
                </Field>

                <Field label="Gender">
                  <ChipSelect
                    value={draft.gender}
                    onChange={(v) => setDraft((d) => ({ ...d, gender: v }))}
                    options={[
                      { value: "", label: "All" },
                      ...GENDERS.map((g) => ({ value: g, label: g })),
                    ]}
                  />
                </Field>

                <Field label="Size">
                  <ChipSelect
                    value={draft.size_ml}
                    onChange={(v) => setDraft((d) => ({ ...d, size_ml: v }))}
                    options={[
                      { value: "", label: "All" },
                      ...SIZES.map((s) => ({ value: s, label: `${s} ml` })),
                    ]}
                  />
                </Field>

                <Field label="Availability">
                  <ChipSelect
                    value={draft.available}
                    onChange={(v) => setDraft((d) => ({ ...d, available: v }))}
                    options={[
                      { value: "", label: "Any" },
                      { value: "1", label: "In stock" },
                    ]}
                  />
                </Field>

                <Field label="Price (LKR)">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      value={draft.min_price}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, min_price: e.target.value }))
                      }
                      placeholder="Min"
                      className="h-10 w-full border border-border bg-secondary/30 px-3 text-sm outline-none focus:ring-1 focus:ring-amber/40"
                    />
                    <input
                      type="number"
                      min={0}
                      value={draft.max_price}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, max_price: e.target.value }))
                      }
                      placeholder="Max"
                      className="h-10 w-full border border-border bg-secondary/30 px-3 text-sm outline-none focus:ring-1 focus:ring-amber/40"
                    />
                  </div>
                </Field>

                <Field label="Note">
                  <input
                    value={draft.note}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, note: e.target.value }))
                    }
                    placeholder="e.g. cedar, vanilla"
                    className="h-10 w-full border border-border bg-secondary/30 px-3 text-sm outline-none focus:ring-1 focus:ring-amber/40"
                  />
                </Field>
              </div>

              <SheetFooter className="border-t border-border/50">
                <button
                  type="button"
                  onClick={clearSheet}
                  className="h-10 border border-border text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={applySheet}
                  className="h-10 bg-amber text-xs uppercase tracking-[0.14em] text-primary-foreground"
                >
                  Show results
                </button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Meta + active pills */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/40 pt-4">
        <p className="text-xs text-muted-foreground">
          {resultCount} {resultCount === 1 ? "fragrance" : "fragrances"}
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function ChipSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value || "all"}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "border px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] transition",
            value === o.value
              ? "border-amber bg-amber/10 text-amber"
              : "border-border text-muted-foreground hover:border-amber/40 hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
