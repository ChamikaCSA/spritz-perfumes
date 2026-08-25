"use client";

import { SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CONCENTRATIONS,
  GENDERS,
  SIZES,
  type ShopFilterDraft,
  type ShopQuery,
} from "@/components/store/catalog/shop-query";
import { cn } from "@/lib/utils";

export function ShopFilterSheet({
  open,
  extra,
  params,
  draft,
  onOpenChange,
  onDraftChange,
  onClear,
  onApply,
}: {
  open: boolean;
  extra: number;
  params: ShopQuery;
  draft: ShopFilterDraft;
  onOpenChange: (open: boolean) => void;
  onDraftChange: (update: Partial<ShopFilterDraft>) => void;
  onClear: () => void;
  onApply: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger
        render={
          <button
            type="button"
            aria-label={extra > 0 ? `Filters, ${extra} active` : "Filters"}
            title="Filters"
            className={cn(
              "relative inline-flex size-11 items-center justify-center border transition sm:size-9",
              extra > 0
                ? "border-amber/50 text-amber"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          />
        }
      >
        <SlidersHorizontal className="size-4" />
        {extra > 0 ? (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-amber text-[10px] font-medium text-primary-foreground">
            {extra}
          </span>
        ) : null}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full border-border bg-background sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Filters</SheetTitle>
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

          <FilterField label="Concentration">
            <ChipSelect
              value={draft.concentration}
              onChange={(v) => onDraftChange({ concentration: v })}
              options={[
                { value: "", label: "All" },
                ...CONCENTRATIONS.map((c) => ({ value: c, label: c })),
              ]}
            />
          </FilterField>

          <FilterField label="Gender">
            <ChipSelect
              value={draft.gender}
              onChange={(v) => onDraftChange({ gender: v })}
              options={[
                { value: "", label: "All" },
                ...GENDERS.map((g) => ({ value: g, label: g })),
              ]}
            />
          </FilterField>

          <FilterField label="Size">
            <ChipSelect
              value={draft.size_ml}
              onChange={(v) => onDraftChange({ size_ml: v })}
              options={[
                { value: "", label: "All" },
                ...SIZES.map((s) => ({ value: s, label: `${s} ml` })),
              ]}
            />
          </FilterField>

          <FilterField label="Availability">
            <ChipSelect
              value={draft.available}
              onChange={(v) => onDraftChange({ available: v })}
              options={[
                { value: "", label: "Any" },
                { value: "1", label: "In stock" },
              ]}
            />
          </FilterField>

          <FilterField label="Price (LKR)">
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                value={draft.min_price}
                onChange={(e) => onDraftChange({ min_price: e.target.value })}
                placeholder="Min"
                className="h-10 w-full border border-border bg-secondary/30 px-3 text-sm outline-none focus:ring-1 focus:ring-amber/40"
              />
              <input
                type="number"
                min={0}
                value={draft.max_price}
                onChange={(e) => onDraftChange({ max_price: e.target.value })}
                placeholder="Max"
                className="h-10 w-full border border-border bg-secondary/30 px-3 text-sm outline-none focus:ring-1 focus:ring-amber/40"
              />
            </div>
          </FilterField>

          <FilterField label="Note">
            <input
              value={draft.note}
              onChange={(e) => onDraftChange({ note: e.target.value })}
              placeholder="e.g. cedar, vanilla"
              className="h-10 w-full border border-border bg-secondary/30 px-3 text-sm outline-none focus:ring-1 focus:ring-amber/40"
            />
          </FilterField>
        </div>

        <SheetFooter className="border-t border-border/50">
          <button
            type="button"
            onClick={onClear}
            className="h-10 border border-border text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onApply}
            className="h-10 bg-amber text-xs uppercase tracking-[0.14em] text-primary-foreground"
          >
            Show results
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function FilterField({
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
