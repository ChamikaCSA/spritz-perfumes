"use client";

import { updateOrderStatus } from "@/actions/admin";
import { AdminFormDialog } from "@/components/admin/form/admin-form-dialog";
import {
  AdminField,
  AdminFieldGrid,
  AdminForm,
  AdminFormSection,
  adminFieldClass,
} from "@/components/admin/form/admin-form";
import { adminButtonClass } from "@/components/admin/layout/admin-shell";
import { AdminStatus, orderStatusTone } from "@/components/admin/layout/admin-status";

const statuses = [
  "pending_payment",
  "paid",
  "packing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
] as const;

export function OrderFulfillmentPanel({
  orderId,
  orderNumber,
  status,
  trackingNumber,
}: {
  orderId: string;
  orderNumber: string;
  status: string;
  trackingNumber: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <AdminStatus tone={orderStatusTone(status)}>
          {status.replaceAll("_", " ")}
        </AdminStatus>
        {trackingNumber ? (
          <span className="text-muted-foreground">
            Tracking {trackingNumber}
          </span>
        ) : (
          <span className="text-muted-foreground">No tracking yet</span>
        )}
      </div>

      <AdminFormDialog
        triggerLabel="Update"
        title={`Update ${orderNumber}`}
        description="Change fulfillment status or add a tracking number."
        size="md"
        triggerVariant="link"
      >
        <AdminForm action={updateOrderStatus} bare>
          <input type="hidden" name="id" value={orderId} />
          <AdminFormSection title="Fulfillment">
            <AdminFieldGrid>
              <AdminField label="Status">
                <select
                  name="status"
                  defaultValue={status}
                  className={adminFieldClass}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </AdminField>
              <AdminField label="Tracking number">
                <input
                  name="tracking_number"
                  defaultValue={trackingNumber ?? ""}
                  placeholder="e.g. EMS123"
                  className={adminFieldClass}
                />
              </AdminField>
            </AdminFieldGrid>
          </AdminFormSection>
          <button type="submit" className={adminButtonClass}>
            Save update
          </button>
        </AdminForm>
      </AdminFormDialog>
    </div>
  );
}
