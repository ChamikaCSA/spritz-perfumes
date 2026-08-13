"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ProductCard } from "@/components/store/product-card";
import { WishlistSkeleton } from "@/components/store/skeletons";
import { FromPrice } from "@/components/store/store-price";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/lib/types";
import { useWishlist } from "@/lib/wishlist-store";

export function WishlistView() {
  const { productIds, hasHydrated, remove } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const loadedIds = useRef(new Set<string>());

  useEffect(() => {
    if (!hasHydrated || !productIds.length) return;

    const wanted = productIds.slice(0, 100);
    const missing = wanted.filter((id) => !loadedIds.current.has(id));
    if (!missing.length) return;

    const ac = new AbortController();
    setLoading(loadedIds.current.size === 0);
    fetch(`/api/catalog/products?ids=${missing.join(",")}`, { signal: ac.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load wishlist");
        const json = (await res.json()) as { products?: Product[] };
        for (const id of missing) loadedIds.current.add(id);
        setProducts((prev) => {
          const byId = new Map(prev.map((p) => [p.id, p]));
          for (const product of json.products ?? []) byId.set(product.id, product);
          return [...byId.values()];
        });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        toast.error("Could not load saved fragrances");
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [hasHydrated, productIds]);

  const saved = useMemo(() => {
    if (!hasHydrated) return [];
    const byId = new Map(products.map((p) => [p.id, p]));
    return productIds
      .map((id) => byId.get(id))
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

  if (!hasHydrated || loading) {
    return <WishlistSkeleton includeHeader={false} />;
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
      <div className="grid grid-cols-2 *:border-r *:border-b *:border-border/40 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
                  <FromPrice variants={product.variants} />
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
