"use client";

import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-store";
import type { Address } from "@/lib/types";
import type { PayHerePaymentPayload } from "@/lib/payhere";
import {
  formatLkr,
  LK_DISTRICTS,
  SHIPPING_LKR,
  variantLabel,
} from "@/lib/utils-commerce";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    payhere?: {
      startPayment: (payment: PayHerePaymentPayload) => void;
      onCompleted?: (orderId: string) => void;
      onDismissed?: () => void;
      onError?: (error: string) => void;
    };
  }
}

type Step = 1 | 2 | 3 | 4;

const emptyInfo = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
};

const emptyShip = {
  address_line1: "",
  address_line2: "",
  city: "",
  district: (LK_DISTRICTS[0] ?? "Colombo") as string,
  postal_code: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear, closeCart, hasHydrated } = useCart();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [info, setInfo] = useState(emptyInfo);
  const [ship, setShip] = useState<{
    address_line1: string;
    address_line2: string;
    city: string;
    district: string;
    postal_code: string;
  }>(emptyShip);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);

  const total = useMemo(
    () =>
      items.reduce((sum, i) => sum + i.unitPriceLkr * i.quantity, 0) +
      SHIPPING_LKR,
    [items],
  );

  useEffect(() => {
    fetch("/api/account/addresses")
      .then((r) =>
        r.ok
          ? r.json()
          : { addresses: [], email: "", phone: "", full_name: "" },
      )
      .then((data) => {
        const list = (data.addresses ?? []) as Address[];
        setAddresses(list);

        const email = String(data.email ?? "");
        const profilePhone = String(data.phone ?? "");
        const fullName = String(data.full_name ?? "").trim();
        const nameParts = fullName ? fullName.split(/\s+/) : [];
        const profileFirst = nameParts[0] ?? "";
        const profileLast = nameParts.slice(1).join(" ");

        const def = list.find((a) => a.is_default) ?? list[0];
        if (def) {
          setInfo({
            first_name: def.first_name,
            last_name: def.last_name,
            email,
            phone: def.phone || profilePhone,
          });
          setShip({
            address_line1: def.address_line1,
            address_line2: def.address_line2 ?? "",
            city: def.city,
            district: def.district,
            postal_code: def.postal_code ?? "",
          });
        } else {
          setInfo({
            first_name: profileFirst,
            last_name: profileLast,
            email,
            phone: profilePhone,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  async function placeOrder() {
    if (!items.length) {
      toast.error("Your bag is empty");
      return;
    }
    setLoading(true);
    closeCart();
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...info,
          ...ship,
          address_line2: ship.address_line2 || null,
          postal_code: ship.postal_code || null,
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create order");

      setOrderId(data.orderId);

      if (data.demo || data.paymentSkipped) {
        clear();
        toast.success(
          data.demo
            ? "Demo order placed"
            : "Order placed — add PayHere keys for live payment",
        );
        setStep(4);
        setLoading(false);
        return;
      }

      if (!window.payhere || !scriptReady) {
        throw new Error("PayHere is still loading — try again in a moment");
      }

      window.payhere.onCompleted = () => {
        clear();
        setStep(4);
        setLoading(false);
      };
      window.payhere.onDismissed = () => {
        toast.message("Payment window closed");
        setLoading(false);
      };
      window.payhere.onError = (err) => {
        toast.error(err || "Payment failed");
        setLoading(false);
      };

      window.payhere.startPayment(data.payment as PayHerePaymentPayload);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  if (!hasHydrated) {
    return <div className="mx-auto max-w-lg px-4 py-16 sm:py-40" aria-hidden />;
  }

  if (!items.length && step !== 4) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:py-40">
        <h1 className="font-display text-4xl">Nothing to checkout</h1>
        <p className="mt-3 text-muted-foreground">
          Add a fragrance to your bag first.
        </p>
        <a
          href="/shop"
          className="mt-8 inline-flex h-11 items-center bg-amber px-6 text-xs uppercase tracking-[0.2em] text-primary-foreground"
        >
          Shop
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28">
      <Script
        src="https://www.payhere.lk/lib/payhere.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <h1 className="font-display text-3xl sm:text-5xl">Checkout</h1>
      <ol className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] sm:mt-6">
        {[
          [1, "Info"],
          [2, "Shipping"],
          [3, "Payment"],
          [4, "Done"],
        ].map(([n, label]) => (
          <li
            key={n}
            className={cn(
              "border px-3 py-1",
              step === n
                ? "border-amber text-amber"
                : step > Number(n)
                  ? "border-border text-foreground"
                  : "border-border text-muted-foreground",
            )}
          >
            {n}. {label}
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-6 lg:mt-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <div>
          {step === 1 && (
            <div className="space-y-3">
              <h2 className="font-display text-2xl">Customer info</h2>
              <Field
                label="First name"
                value={info.first_name}
                onChange={(v) => setInfo({ ...info, first_name: v })}
              />
              <Field
                label="Last name"
                value={info.last_name}
                onChange={(v) => setInfo({ ...info, last_name: v })}
              />
              <Field
                label="Email"
                type="email"
                value={info.email}
                onChange={(v) => setInfo({ ...info, email: v })}
              />
              <Field
                label="Phone"
                value={info.phone}
                onChange={(v) => setInfo({ ...info, phone: v })}
              />
              <button
                type="button"
                className="h-11 bg-amber px-6 text-xs uppercase tracking-[0.18em] text-primary-foreground"
                onClick={() => {
                  if (!info.first_name || !info.last_name || !info.email || !info.phone) {
                    toast.error("Fill in all fields");
                    return;
                  }
                  setStep(2);
                }}
              >
                Continue to shipping
              </button>
            </div>
          )}

          {step === 2 && (
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
                        setInfo({
                          ...info,
                          first_name: a.first_name,
                          last_name: a.last_name,
                          phone: a.phone,
                        });
                        setShip({
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
              <Field
                label="Address"
                value={ship.address_line1}
                onChange={(v) => setShip({ ...ship, address_line1: v })}
              />
              <Field
                label="Address line 2"
                value={ship.address_line2}
                onChange={(v) => setShip({ ...ship, address_line2: v })}
              />
              <Field
                label="City"
                value={ship.city}
                onChange={(v) => setShip({ ...ship, city: v })}
              />
              <label className="block text-xs uppercase tracking-wider text-muted-foreground">
                District
                <select
                  className="mt-1 h-11 w-full border border-border bg-secondary/40 px-3 text-sm"
                  value={ship.district}
                  onChange={(e) =>
                    setShip({ ...ship, district: e.target.value })
                  }
                >
                  {LK_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <Field
                label="Postal code"
                value={ship.postal_code}
                onChange={(v) => setShip({ ...ship, postal_code: v })}
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="h-11 border border-border px-6 text-xs uppercase tracking-[0.18em] sm:w-auto"
                  onClick={() => setStep(1)}
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
                    setStep(3);
                  }}
                >
                  Continue to payment
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl">Payment</h2>
              <p className="text-sm text-muted-foreground">
                Review your order, then pay securely with PayHere (or place
                without live keys in sandbox).
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="h-11 border border-border px-6 text-xs uppercase tracking-[0.18em] sm:w-auto"
                  onClick={() => setStep(2)}
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  className="h-11 bg-amber px-6 text-xs uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-60 sm:flex-1"
                  onClick={placeOrder}
                >
                  {loading ? "Processing…" : "Pay now"}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl">Confirmation</h2>
              <p className="text-muted-foreground">
                Thank you. Your order
                {orderId ? ` is ready` : " was placed"}.
              </p>
              {orderId ? (
                <button
                  type="button"
                  className="h-11 bg-amber px-6 text-xs uppercase tracking-[0.18em] text-primary-foreground"
                  onClick={() => router.push(`/orders/${orderId}`)}
                >
                  View order
                </button>
              ) : (
                <a
                  href="/account"
                  className="inline-flex h-11 items-center bg-amber px-6 text-xs uppercase tracking-[0.18em] text-primary-foreground"
                >
                  Account
                </a>
              )}
            </div>
          )}
        </div>

        <aside className="border border-border p-5">
          <h2 className="font-display text-2xl">Bag</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((item) => (
              <li key={item.variantId} className="flex justify-between gap-3">
                <span className="min-w-0 flex-1 truncate">
                  {item.productName} ·{" "}
                  {variantLabel(item.variantType, item.sizeMl)} × {item.quantity}
                </span>
                <span className="shrink-0 tabular-nums">
                  {formatLkr(item.unitPriceLkr * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatLkr(SHIPPING_LKR)}</span>
            </div>
            <div className="flex justify-between font-medium text-amber">
              <span>Total</span>
              <span>{formatLkr(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-xs uppercase tracking-wider text-muted-foreground">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-11 w-full border border-border bg-secondary/40 px-3 text-sm outline-none focus:ring-1 focus:ring-amber"
      />
    </label>
  );
}
