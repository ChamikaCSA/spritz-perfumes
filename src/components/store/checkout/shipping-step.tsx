import { toast } from "sonner";
import { CheckoutField } from "@/components/store/checkout/checkout-field";
import { DistrictSelect } from "@/components/store/checkout/district-select";
import type { Address } from "@/types";
import type { CheckoutContact } from "@/components/store/checkout/contact-step";

export type CheckoutShipping = {
  address_line1: string;
  address_line2: string;
  city: string;
  district: string;
  postal_code: string;
};

export function ShippingStep({
  info,
  ship,
  addresses,
  onInfoChange,
  onShipChange,
  onBack,
  onContinue,
}: {
  info: CheckoutContact;
  ship: CheckoutShipping;
  addresses: Address[];
  onInfoChange: (info: CheckoutContact) => void;
  onShipChange: (ship: CheckoutShipping) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl">Shipping</h2>
      {addresses.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Saved addresses
          </p>
          {addresses.map((a) => (
            <button
              key={a.id}
              type="button"
              className="block w-full border border-border px-3 py-2 text-left text-sm hover:border-amber"
              onClick={() => {
                onInfoChange({
                  ...info,
                  first_name: a.first_name,
                  last_name: a.last_name,
                  phone: a.phone,
                });
                onShipChange({
                  address_line1: a.address_line1,
                  address_line2: a.address_line2 ?? "",
                  city: a.city,
                  district: a.district,
                  postal_code: a.postal_code ?? "",
                });
              }}
            >
              {a.label}: {a.address_line1}, {a.city}
            </button>
          ))}
        </div>
      )}
      <CheckoutField
        label="Address"
        value={ship.address_line1}
        onChange={(v) => onShipChange({ ...ship, address_line1: v })}
      />
      <CheckoutField
        label="Address line 2"
        value={ship.address_line2}
        onChange={(v) => onShipChange({ ...ship, address_line2: v })}
      />
      <CheckoutField
        label="City"
        value={ship.city}
        onChange={(v) => onShipChange({ ...ship, city: v })}
      />
      <label className="block text-xs uppercase tracking-wider text-muted-foreground">
        District
        <DistrictSelect
          value={ship.district}
          onChange={(district) => onShipChange({ ...ship, district })}
          className="mt-1 h-11 w-full border border-border bg-secondary/40 px-3 text-sm"
        />
      </label>
      <CheckoutField
        label="Postal code"
        value={ship.postal_code}
        onChange={(v) => onShipChange({ ...ship, postal_code: v })}
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="h-11 border border-border px-6 text-xs uppercase tracking-[0.18em] sm:w-auto"
          onClick={onBack}
        >
          Back
        </button>
        <button
          type="button"
          className="h-11 bg-amber px-6 text-xs uppercase tracking-[0.18em] text-primary-foreground sm:flex-1"
          onClick={() => {
            if (!ship.address_line1 || !ship.city || !ship.district) {
              toast.error("Fill in shipping fields");
              return;
            }
            onContinue();
          }}
        >
          Continue to payment
        </button>
      </div>
    </div>
  );
}
