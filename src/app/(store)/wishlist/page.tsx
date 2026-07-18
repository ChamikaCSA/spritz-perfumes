import { WishlistView } from "@/components/store/wishlist-view";
import { getProducts } from "@/lib/catalog";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const products = await getProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pt-32">
      <div className="mb-6 sm:mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-amber">Saved</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl lg:text-6xl">Wishlist</h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          Fragrances you want to revisit — move them to your bag when you are
          ready.
        </p>
      </div>
      <WishlistView products={products} />
    </div>
  );
}
