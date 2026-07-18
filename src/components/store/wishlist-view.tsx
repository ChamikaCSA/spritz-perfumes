"use client";

import Link from "next/link";
import { useMemo } from "react";
import { toast } from "sonner";
import { ProductCard } from "@/components/store/product-card";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import type { Product } from "@/lib/types";
import { formatLkr, lowestPrice } from "@/lib/utils-commerce";

export function WishlistView({ products }: { products: Product[] }) {
  const { productIds, hasHydrated, remove } = useWishlist();
  const { addItem } = useCart();

  const saved = useMemo(() => {
    if (!hasHydrated) return [];
    return productIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as Product[];
  }, [hasHydrated, productIds, products]);

  function moveToCart(product: Product) {
    const variant =
      product.variants?.find((v) => v.is_active && v.purchasable !== false) ??
      product.variants?.[0];
    if (!variant) {
      toast.error("No variant available");
      return;
    }
    addItem({
      variantId: variant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      brandName: product.brand?.name ?? "",
      variantType: variant.type,
      sizeMl: Number(variant.size_ml),
      unitPriceLkr: Number(variant.price_lkr),
      sku: variant.sku,
      image: product.images[0],
    });
    remove(product.id);
    toast.success("Moved to bag");
  }

  if (!hasHydrated) {
    return (
      <p className="py-16 text-center text-muted-foreground">Loading wishlist…</p>
    );
  }

  if (saved.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Your wishlist is empty.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center bg-amber px-6 text-xs uppercase tracking-[0.2em] text-primary-foreground"
        >
          Browse shop
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 [&>*]:border-r [&>*]:border-b [&>*]:border-border/40 md:grid-cols-3 lg:grid-cols-4">
        {saved.map((product, i) => (
          <div key={product.id} className="flex flex-col bg-background">
            <ProductCard product={product} index={i} />
            <div className="flex flex-col gap-2 px-3 pb-4">
              <button
                type="button"
                onClick={() => moveToCart(product)}
                className="flex h-11 flex-col items-center justify-center bg-amber px-2 text-[10px] uppercase tracking-[0.18em] text-primary-foreground sm:flex-row sm:gap-1.5"
              >
                <span>Move to bag</span>
                <span className="font-normal normal-case tracking-normal text-primary-foreground/80 sm:before:mr-1.5 sm:before:content-['·']">
                  from {formatLkr(lowestPrice(product.variants))}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  remove(product.id);
                  toast.success("Removed");
                }}
                className="h-11 border border-border text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
