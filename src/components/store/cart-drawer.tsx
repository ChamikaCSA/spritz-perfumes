"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatLkr, variantLabel } from "@/lib/utils-commerce";
import { SHIPPING_LKR } from "@/lib/utils-commerce";

export function CartDrawer() {
  const { items, isOpen, closeCart, setQuantity, removeItem, subtotal } =
    useCart();
  const total = subtotal();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close cart backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/10 backdrop-blur-xs"
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 right-0 z-70 flex w-full max-w-md flex-col border-l border-border bg-background shadow-lg pt-[env(safe-area-inset-top)]"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-2xl tracking-wide">Your bag</h2>
              <button
                type="button"
                onClick={closeCart}
                className="inline-flex size-11 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                aria-label="Close cart"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  Your bag is empty. Discover a fragrance worth carrying.
                </p>
              ) : (
                <ul className="space-y-5">
                  {items.map((item) => (
                    <li key={item.variantId} className="flex gap-4">
                      <div className="relative size-20 shrink-0 overflow-hidden bg-background">
                        {item.image && (
                          <>
                            <Image
                              src={item.image}
                              alt={item.productName}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                            <div
                              aria-hidden
                              className="pointer-events-none absolute inset-0 image-edge-fade-sm"
                            />
                          </>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          {item.brandName}
                        </p>
                        <p className="truncate font-medium">{item.productName}</p>
                        <p className="mt-0.5 text-xs text-amber">
                          {variantLabel(item.variantType, item.sizeMl)}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center border border-border">
                            <button
                              type="button"
                              className="inline-flex size-11 items-center justify-center hover:text-amber"
                              aria-label="Decrease quantity"
                              onClick={() =>
                                setQuantity(item.variantId, item.quantity - 1)
                              }
                            >
                              <Minus className="size-4" />
                            </button>
                            <span className="w-6 text-center text-sm">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="inline-flex size-11 items-center justify-center hover:text-amber"
                              aria-label="Increase quantity"
                              onClick={() =>
                                setQuantity(item.variantId, item.quantity + 1)
                              }
                            >
                              <Plus className="size-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.variantId)}
                            className="px-2 py-2 text-xs text-muted-foreground hover:text-destructive"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <p className="shrink-0 text-sm tabular-nums">
                        {formatLkr(item.unitPriceLkr * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <div className="mb-1 flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatLkr(total)}</span>
                </div>
                <div className="mb-4 flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span>{formatLkr(SHIPPING_LKR)}</span>
                </div>
                <div className="mb-5 flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatLkr(total + SHIPPING_LKR)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex h-12 w-full items-center justify-center bg-amber text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-amber-soft"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
