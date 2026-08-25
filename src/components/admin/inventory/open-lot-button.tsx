"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { openLot, resealLot } from "@/actions/admin";
import {
  adminRowActionClass,
  adminRowActionPrimaryClass,
} from "@/components/admin/layout/admin-shell";

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
      className={adminRowActionPrimaryClass}
    >
      {pending ? "…" : "Open"}
    </button>
  );
}

export function ResealLotButton({ lotId }: { lotId: string }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            await resealLot(lotId);
            toast.success("Resealed");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed");
          }
        })
      }
      className={adminRowActionClass}
    >
      {pending ? "…" : "Reseal"}
    </button>
  );
}
