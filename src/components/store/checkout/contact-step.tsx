import { toast } from "sonner";
import { CheckoutField } from "@/components/store/checkout/checkout-field";

export type CheckoutContact = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

export function ContactStep({
  info,
  onChange,
  onContinue,
}: {
  info: CheckoutContact;
  onChange: (info: CheckoutContact) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl">Customer info</h2>
      <CheckoutField
        label="First name"
        value={info.first_name}
        onChange={(v) => onChange({ ...info, first_name: v })}
      />
      <CheckoutField
        label="Last name"
        value={info.last_name}
        onChange={(v) => onChange({ ...info, last_name: v })}
      />
      <CheckoutField
        label="Email"
        type="email"
        value={info.email}
        onChange={(v) => onChange({ ...info, email: v })}
      />
      <CheckoutField
        label="Phone"
        value={info.phone}
        onChange={(v) => onChange({ ...info, phone: v })}
      />
      <button
        type="button"
        className="h-11 bg-amber px-6 text-xs uppercase tracking-[0.18em] text-primary-foreground"
        onClick={() => {
          if (!info.first_name || !info.last_name || !info.email || !info.phone) {
            toast.error("Fill in all fields");
            return;
          }
          onContinue();
        }}
      >
        Continue to shipping
      </button>
    </div>
  );
}
