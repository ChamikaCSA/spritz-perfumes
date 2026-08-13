"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { importCatalogCsv } from "@/actions/admin";
import { useAdminFormDialog } from "@/components/admin/admin-form-dialog";
import { AdminFormSection } from "@/components/admin/admin-form";
import { AdminFileField } from "@/components/admin/admin-file-field";
import {
  adminButtonClass,
  adminTextLinkClass,
} from "@/components/admin/admin-shell";
import {
  buildCatalogCsvTemplate,
  MAX_CATALOG_CSV_BYTES,
  type CatalogImportResult,
} from "@/lib/catalog-import";

function downloadTemplate() {
  const blob = new Blob([buildCatalogCsvTemplate()], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "spritz-catalog-import.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function summarize(result: CatalogImportResult) {
  const parts: string[] = [];
  if (result.createdBrands) parts.push(`${result.createdBrands} brand(s)`);
  if (result.createdProducts) parts.push(`${result.createdProducts} product(s)`);
  if (result.updatedProducts) parts.push(`${result.updatedProducts} updated`);
  if (result.createdVariants) parts.push(`${result.createdVariants} variant(s)`);
  if (result.updatedVariants)
    parts.push(`${result.updatedVariants} variant update(s)`);
  return parts.length ? parts.join(", ") : "No changes";
}

export function CatalogCsvImport() {
  const dialog = useAdminFormDialog();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<CatalogImportResult | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      const next = await importCatalogCsv(formData);
      setResult(next);
      const summary = summarize(next);
      if (!next.errors.length) {
        toast.success(
          summary === "No changes" ? "Nothing to import" : `Imported ${summary}`,
        );
        if (summary !== "No changes") dialog?.close();
      } else {
        toast.error(
          `${summary}. ${next.errors.length} row${next.errors.length === 1 ? "" : "s"} failed.`,
        );
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4 sm:space-y-6">
      <AdminFormSection
        description="One row per variant. Repeat brand + name for extra sizes, or leave them blank to continue the previous fragrance. Images are added later on each product."
      >
        <AdminFileField
          label="CSV file"
          name="file"
          accept=".csv,text/csv,text/plain"
          required
          hint={`Quoted commas in notes are supported · max ${Math.round(MAX_CATALOG_CSV_BYTES / (1024 * 1024))}MB`}
        />
        <button
          type="button"
          onClick={downloadTemplate}
          className={adminTextLinkClass}
        >
          Download sample CSV
        </button>
      </AdminFormSection>

      {result ? (
        <div className="space-y-2 border border-border/40 bg-ink/20 px-3 py-3 text-sm">
          <p>{summarize(result)}</p>
          {result.errors.length ? (
            <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-red-400">
              {result.errors.slice(0, 50).map((error) => (
                <li key={`${error.row}-${error.message}`}>
                  Row {error.row}: {error.message}
                </li>
              ))}
              {result.errors.length > 50 ? (
                <li>…and {result.errors.length - 50} more</li>
              ) : null}
            </ul>
          ) : null}
        </div>
      ) : null}

      <button type="submit" disabled={pending} className={adminButtonClass}>
        {pending ? "Importing…" : "Import CSV"}
      </button>
    </form>
  );
}
