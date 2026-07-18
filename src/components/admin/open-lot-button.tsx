"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { openLot } from "@/actions/admin";

export function OpenLotButton({ lotId }: { lotId: string }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            await openLot(lotId);
            toast.success("Opened for decanting");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed");
          }
        })
      }
      className="inline-flex min-h-9 items-center px-1.5 text-[11px] uppercase tracking-wider text-amber hover:underline disabled:opacity-50 sm:min-h-11 sm:px-2 sm:text-xs"
    >
      {pending ? "…" : "Open"}
    </button>
  );
}
