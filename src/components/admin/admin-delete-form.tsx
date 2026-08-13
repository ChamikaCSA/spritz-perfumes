"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useAdminFormDialog } from "@/components/admin/admin-form-dialog";
import { adminGhostButtonClass } from "@/components/admin/admin-shell";
import { cn } from "@/lib/utils";

const deleteButtonClass =
  "inline-flex h-11 flex-1 items-center justify-center border border-red-500/30 px-5 text-xs uppercase tracking-[0.18em] text-red-400 transition hover:border-red-500/60 hover:bg-red-500/10 disabled:opacity-50 sm:flex-none sm:px-6";

export function AdminDeleteForm({
  action,
  id,
  label = "Delete",
  name,
  description,
  className,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label?: string;
  name: string;
  description?: string;
  className?: string;
}) {
  const dialog = useAdminFormDialog();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [armed, setArmed] = useState(false);

  function confirmDelete() {
    if (pending) return;
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      try {
        await action(formData);
        dialog?.close();
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not delete");
      }
    });
  }

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className={cn(deleteButtonClass, className)}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Delete {name}?
        {description ? ` ${description}` : ""}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setArmed(false)}
          disabled={pending}
          className={adminGhostButtonClass}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={confirmDelete}
          className={deleteButtonClass}
        >
          {pending ? "Deleting…" : label}
        </button>
      </div>
    </div>
  );
}
