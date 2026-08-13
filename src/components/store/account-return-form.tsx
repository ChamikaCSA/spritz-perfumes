"use client";

import { useState } from "react";
import { createReturnRequest } from "@/actions/store";
import {
  AccountPanel,
  accountButtonClass,
  accountFieldClass,
  accountTextareaClass,
} from "@/components/store/account-shell";

type ReturnableOrder = {
  id: string;
  order_number: string;
  status: string;
};

export function AccountReturnForm({
  orders,
  children,
}: {
  orders: ReturnableOrder[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <AccountPanel
      title="Your requests"
      action={
        orders.length ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex min-h-11 items-center text-xs uppercase tracking-[0.16em] text-amber hover:underline"
          >
            {open ? "Cancel" : "Request a return"}
          </button>
        ) : undefined
      }
    >
      {!orders.length ? (
        <p className="mb-4 text-sm text-muted-foreground sm:mb-5">
          No eligible orders right now. Returns open after payment clears.
        </p>
      ) : open ? (
        <form action={createReturnRequest} className="mb-5 space-y-3 sm:mb-6">
          <select
            name="order_id"
            required
            className={accountFieldClass}
            defaultValue=""
          >
            <option value="" disabled>
              Select order
            </option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.order_number} · {o.status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <textarea
            name="reason"
            required
            placeholder="Reason for return"
            className={accountTextareaClass}
          />
          <button type="submit" className={`${accountButtonClass} w-full sm:w-auto`}>
            Submit request
          </button>
        </form>
      ) : null}
      {children}
    </AccountPanel>
  );
}
