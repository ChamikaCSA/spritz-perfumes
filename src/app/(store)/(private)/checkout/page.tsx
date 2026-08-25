"use client";

import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckoutBag } from "@/components/store/checkout/checkout-bag";
import {
  ConfirmationStep,
} from "@/components/store/checkout/confirmation-step";
import {
  ContactStep,
  type CheckoutContact,
} from "@/components/store/checkout/contact-step";
import { ReviewStep } from "@/components/store/checkout/review-step";
import {
  ShippingStep,
  type CheckoutShipping,
} from "@/components/store/checkout/shipping-step";
import { LK_DISTRICTS, SHIPPING_LKR } from "@/lib/commerce";
import type { PayHerePaymentPayload } from "@/lib/payments/payhere";
import { cn } from "@/lib/utils";
import { useCart } from "@/stores/cart-store";
import type { Address } from "@/types";

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

const emptyInfo: CheckoutContact = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
};

const emptyShip: CheckoutShipping = {
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
  const [ship, setShip] = useState<CheckoutShipping>(emptyShip);
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
            <ContactStep
              info={info}
              onChange={setInfo}
              onContinue={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <ShippingStep
              info={info}
              ship={ship}
              addresses={addresses}
              onInfoChange={setInfo}
              onShipChange={setShip}
              onBack={() => setStep(1)}
              onContinue={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <ReviewStep
              loading={loading}
              onBack={() => setStep(2)}
              onPay={placeOrder}
            />
          )}
          {step === 4 && (
            <ConfirmationStep
              orderId={orderId}
              onViewOrder={() => router.push(`/orders/${orderId}`)}
            />
          )}
        </div>
        <CheckoutBag items={items} total={total} />
      </div>
    </div>
  );
}
