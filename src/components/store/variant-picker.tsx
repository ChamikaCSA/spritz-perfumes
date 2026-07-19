"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-store";
import type { Product, ProductVariant, StockSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatLkr, formatMl } from "@/lib/utils-commerce";

function isPurchasable(v: ProductVariant, stock: StockSummary) {
  if (v.purchasable === false) return false;
  if (v.purchasable === true) return true;
  if (v.type === "full_size") return stock.sealedBottles >= 1;
  return stock.openMl >= Number(v.size_ml);
}

export function VariantPicker({
  product,
  stock,
  initialType,
}: {
  product: Product;
  stock: StockSummary;
  initialType?: "full_size" | "decant";
}) {
  const router = useRouter();
  const variants = product.variants ?? [];
  const bottles = variants.filter((v) => v.type === "full_size");
  const decants = variants.filter((v) => v.type === "decant");

  const preferred =
    initialType === "decant" && decants.length > 0
      ? "decant"
      : initialType === "full_size" && bottles.length > 0
        ? "full_size"
        : bottles.length
          ? "full_size"
          : "decant";

  const [mode, setMode] = useState<"full_size" | "decant">(preferred);
  const options = mode === "full_size" ? bottles : decants;
  const firstBuyable = options.find((v) => isPurchasable(v, stock));
  const [selectedId, setSelectedId] = useState(
    firstBuyable?.id ?? options[0]?.id,
  );
  const selected = useMemo(
    () => options.find((v) => v.id === selectedId) ?? options[0],
    [options, selectedId],
  );
  const { addItem, closeCart } = useCart();
  const canBuy = selected ? isPurchasable(selected, stock) : false;

  function switchMode(next: "full_size" | "decant") {
    setMode(next);
    const list = next === "full_size" ? bottles : decants;
    const buyable = list.find((v) => isPurchasable(v, stock));
    setSelectedId(buyable?.id ?? list[0]?.id);
  }

  function cartPayload(v: ProductVariant) {
    return {
      variantId: v.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      brandName: product.brand?.name ?? "",
      variantType: v.type,
      sizeMl: Number(v.size_ml),
      unitPriceLkr: Number(v.price_lkr),
      sku: v.sku,
      image: product.images[0],
    };
  }

  function handleAdd() {
    if (!selected || !canBuy) {
      toast.error("This size is currently unavailable");
      return;
    }
    addItem(cartPayload(selected));
    toast.success("Added to bag");
  }

  function handleBuyNow() {
    if (!selected || !canBuy) {
      toast.error("This size is currently unavailable");
      return;
    }
    addItem(cartPayload(selected));
    closeCart();
    router.push("/checkout");
  }

  return (
    <div className="space-y-3.5 sm:space-y-4">
      <div className="flex border border-border">
        {bottles.length > 0 && (
          <button
            type="button"
            onClick={() => switchMode("full_size")}
            className={cn(
              "min-h-11 flex-1 py-2.5 text-xs uppercase tracking-[0.2em] transition",
              mode === "full_size"
                ? "bg-amber text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Full size
          </button>
        )}
        {decants.length > 0 && (
          <button
            type="button"
            onClick={() => switchMode("decant")}
            className={cn(
              "min-h-11 flex-1 py-2.5 text-xs uppercase tracking-[0.2em] transition",
              mode === "decant"
                ? "bg-amber text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Decant
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((v: ProductVariant) => {
          const available = isPurchasable(v, stock);
          return (
            <button
              key={v.id}
              type="button"
              disabled={!available}
              onClick={() => setSelectedId(v.id)}
              className={cn(
                "min-h-11 min-w-17 border px-3.5 py-2 text-sm transition",
                selected?.id === v.id
                  ? "border-amber text-amber"
                  : "border-border text-muted-foreground hover:border-amber/50",
                !available && "cursor-not-allowed opacity-35",
              )}
            >
              {formatMl(Number(v.size_ml))}
            </button>
          );
        })}
      </div>

      <div>
        <AnimatePresence mode="wait">
          <motion.p
            key={selected?.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="font-display text-3xl text-amber sm:text-4xl"
          >
            {selected ? formatLkr(Number(selected.price_lkr)) : "—"}
          </motion.p>
        </AnimatePresence>
        <p className="mt-1 text-xs text-muted-foreground">
          {mode === "full_size"
            ? `${stock.sealedBottles} sealed bottle${stock.sealedBottles === 1 ? "" : "s"} available`
            : `${stock.openMl} ml available for decanting`}
        </p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selected || !canBuy}
          className="h-12 w-full bg-amber text-xs font-medium uppercase tracking-[0.22em] text-primary-foreground transition hover:bg-amber-soft disabled:opacity-40"
        >
          Add to bag
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!selected || !canBuy}
          className="h-12 w-full border border-amber text-xs font-medium uppercase tracking-[0.22em] text-amber transition hover:bg-amber/10 disabled:opacity-40"
        >
          Buy now
        </button>
      </div>
    </div>
  );
}
