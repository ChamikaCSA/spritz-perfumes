"use client";

import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminFormSection, adminFieldClass } from "@/components/admin/form/admin-form";
import { adminGhostButtonClass } from "@/components/admin/layout/admin-shell";
import type { VariantPackItem } from "@/lib/catalog/import";
import type { VariantType } from "@/types";

type PackRow = {
  key: string;
  id?: string;
  type: VariantType;
  size_ml: string;
  price_lkr: string;
  compare_at_price_lkr: string;
};

type ExistingVariant = {
  id?: string;
  type: string;
  size_ml: number;
  price_lkr: number;
  compare_at_price_lkr?: number | null;
};

const DEFAULTS: Omit<PackRow, "key">[] = [
  { type: "decant", size_ml: "2", price_lkr: "", compare_at_price_lkr: "" },
  { type: "decant", size_ml: "5", price_lkr: "", compare_at_price_lkr: "" },
  { type: "decant", size_ml: "10", price_lkr: "", compare_at_price_lkr: "" },
];

function takenKey(type: string, sizeMl: number | string) {
  return `${type}:${Number(sizeMl)}`;
}

function initialRows(existing?: ExistingVariant[]): PackRow[] {
  if (existing) {
    return existing.map((variant) => ({
      key: variant.id ?? `d${variant.size_ml}`,
      id: variant.id,
      type: variant.type === "full_size" ? "full_size" : "decant",
      size_ml: String(variant.size_ml),
      price_lkr: String(Number(variant.price_lkr)),
      compare_at_price_lkr:
        variant.compare_at_price_lkr != null &&
        Number(variant.compare_at_price_lkr) > 0
          ? String(Number(variant.compare_at_price_lkr))
          : "",
    }));
  }

  return DEFAULTS.map((row) => ({ ...row, key: `d${row.size_ml}` }));
}

export function ProductVariantPackFields({
  existing,
}: {
  existing?: ExistingVariant[];
}) {
  const [rows, setRows] = useState(() => initialRows(existing));

  const payload = useMemo(() => {
    const items: VariantPackItem[] = [];
    const seen = new Set<string>();
    for (const row of rows) {
      const size_ml = Number(row.size_ml);
      const price_lkr = Number(row.price_lkr);
      if (!Number.isFinite(size_ml) || size_ml <= 0) continue;
      if (!Number.isFinite(price_lkr) || price_lkr < 0) continue;
      const key = takenKey(row.type, size_ml);
      if (seen.has(key)) continue;
      seen.add(key);
      const compareRaw = row.compare_at_price_lkr.trim();
      const compare = compareRaw ? Number(compareRaw) : null;
      items.push({
        id: row.id,
        type: row.type,
        size_ml,
        price_lkr,
        compare_at_price_lkr:
          compare != null && Number.isFinite(compare) && compare > 0
            ? compare
            : null,
        is_active: true,
      });
    }
    return items;
  }, [rows]);

  function updateRow(key: string, patch: Partial<PackRow>) {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  return (
    <AdminFormSection title="Variants">
      <input type="hidden" name="variant_pack" value={JSON.stringify(payload)} />
      <div className="space-y-2">
        {rows.length ? (
          <>
            <div className="hidden grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)_minmax(0,1fr)_2.75rem] gap-2 px-0.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:grid">
              <span>Type</span>
              <span>
                ml <span className="text-amber">*</span>
              </span>
              <span>
                Price (LKR) <span className="text-amber">*</span>
              </span>
              <span>Compare-at</span>
              <span className="sr-only">Remove</span>
            </div>
            <ul className="space-y-2">
              {rows.map((row) => (
                <li
                  key={row.key}
                  className="grid grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)_minmax(0,1fr)_2.75rem] gap-2"
                >
                  <select
                    value={row.type}
                    onChange={(e) =>
                      updateRow(row.key, { type: e.target.value as VariantType })
                    }
                    className={adminFieldClass}
                    aria-label="Type"
                  >
                    <option value="decant">Decant</option>
                    <option value="full_size">Full size</option>
                  </select>
                  <input
                    type="number"
                    min={0.1}
                    step="0.1"
                    required
                    value={row.size_ml}
                    onChange={(e) =>
                      updateRow(row.key, { size_ml: e.target.value })
                    }
                    className={adminFieldClass}
                    aria-label="Size (ml)"
                    placeholder="ml"
                  />
                  <input
                    type="number"
                    min={0}
                    step="1"
                    required
                    value={row.price_lkr}
                    onChange={(e) =>
                      updateRow(row.key, { price_lkr: e.target.value })
                    }
                    className={adminFieldClass}
                    aria-label="Price (LKR)"
                    placeholder="Price"
                  />
                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={row.compare_at_price_lkr}
                    onChange={(e) =>
                      updateRow(row.key, {
                        compare_at_price_lkr: e.target.value,
                      })
                    }
                    className={adminFieldClass}
                    aria-label="Compare-at (LKR)"
                    placeholder="Was"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setRows((prev) => prev.filter((item) => item.key !== row.key))
                    }
                    className="flex size-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
                    aria-label="Remove size"
                  >
                    <X className="size-4" strokeWidth={1.75} />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <button
          type="button"
          onClick={() =>
            setRows((prev) => [
              ...prev,
              {
                key: `extra-${Date.now()}`,
                type: "decant",
                size_ml: "",
                price_lkr: "",
                compare_at_price_lkr: "",
              },
            ])
          }
          className={adminGhostButtonClass}
        >
          Add row
        </button>
      </div>
    </AdminFormSection>
  );
}
