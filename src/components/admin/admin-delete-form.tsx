"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useAdminFormDialog } from "@/components/admin/admin-form-dialog";
import { cn } from "@/lib/utils";

export function AdminDeleteForm({
  action,
  id,
  label = "Delete",
  confirmMessage,
  className,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label?: string;
  confirmMessage: string;
  className?: string;
}) {
  const dialog = useAdminFormDialog();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(confirmMessage)) return;
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      await action(formData);
      dialog?.close();
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={cn(
        "inline-flex h-11 items-center justify-center border border-red-500/30 px-4 text-xs uppercase tracking-[0.14em] text-red-400 transition hover:border-red-500/60 hover:bg-red-500/10 disabled:opacity-50",
        className,
      )}
    >
      {label}
    </button>
  );
}
