import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Page not found",
  description: "The page you are looking for could not be found.",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-amber">404</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">Page not found</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        This fragrance may have moved. Try the shop or browse by brand.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/shop"
          className="inline-flex h-11 items-center justify-center bg-amber px-6 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground hover:bg-amber-soft"
        >
          Shop all
        </Link>
        <Link
          href="/brands"
          className="inline-flex h-11 items-center justify-center border border-border/60 px-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground hover:text-amber"
        >
          Browse brands
        </Link>
      </div>
    </div>
  );
}
