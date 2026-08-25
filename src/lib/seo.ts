import type { Metadata } from "next";
import { BRAND_CONTACT, BRAND_SOCIAL } from "@/lib/site";
import type { Brand, Product, Review, StockSummary } from "@/types";

export const siteConfig = {
  name: "Spritz Perfumes",
  shortName: "Spritz",
  defaultTitle: "Spritz Perfumes",
  defaultDescription:
    "Full size and fine decants from the world's finest houses. Authentically sourced, carefully poured — delivered across Sri Lanka.",
  locale: "en_LK",
  defaultOgImage: "/brand/spritz-logo.png",
} as const;

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

/** Website URL with UTM params for social bios and campaigns. */
export function siteUrlWithUtm(
  source: string,
  medium = "social",
  campaign = "bio",
): string {
  const url = new URL(getSiteUrl());
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", campaign);
  return url.toString();
}

export function resolveOgImage(image?: string | null): string {
  if (!image) return absoluteUrl(siteConfig.defaultOgImage);
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  return absoluteUrl(image);
}

type BuildMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  image?: string | null;
  noIndex?: boolean;
};

export function buildMetadata({
  title,
  description,
  path,
  image,
  noIndex = false,
}: BuildMetadataOptions = {}): Metadata {
  const resolvedTitle = title ?? siteConfig.defaultTitle;
  const resolvedDescription = description ?? siteConfig.defaultDescription;
  const canonical = path ? absoluteUrl(path) : undefined;
  const ogImage = resolveOgImage(image);

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: canonical ? { canonical } : undefined,
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonical,
      images: [{ url: ogImage, alt: resolvedTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      images: [ogImage],
    },
  };
}

export const privateRouteMetadata: Metadata = {
  robots: { index: false, follow: false },
};

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: getSiteUrl(),
    logo: absoluteUrl(siteConfig.defaultOgImage),
    email: BRAND_CONTACT.email,
    telephone: BRAND_CONTACT.whatsappDisplay,
    sameAs: [
      ...BRAND_SOCIAL.map((s) => s.href),
      BRAND_CONTACT.whatsappChannelUrl,
      BRAND_CONTACT.whatsappChatUrl,
    ],
    areaServed: {
      "@type": "Country",
      name: "Sri Lanka",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: getSiteUrl(),
    description: siteConfig.defaultDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/shop")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

function variantPriceRange(product: Product) {
  const prices = (product.variants ?? [])
    .filter((v) => v.is_active)
    .map((v) => Number(v.price_lkr))
    .filter((n) => Number.isFinite(n));
  if (!prices.length) return { low: 0, high: 0 };
  return { low: Math.min(...prices), high: Math.max(...prices) };
}

function productInStock(stock: StockSummary, product: Product): boolean {
  return (product.variants ?? []).some((v) =>
    v.type === "full_size"
      ? stock.sealedBottles >= 1
      : stock.openMl >= Number(v.size_ml),
  );
}

export function productJsonLd(
  product: Product,
  stock: StockSummary,
  reviews: Review[],
) {
  const { low, high } = variantPriceRange(product);
  const inStock = productInStock(stock, product);
  const images = product.images?.length
    ? product.images.map((img) => resolveOgImage(img))
    : [resolveOgImage(null)];

  const aggregateRating =
    product.avg_rating != null &&
    product.avg_rating > 0 &&
    (product.review_count ?? 0) > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: Number(product.avg_rating).toFixed(1),
          reviewCount: product.review_count,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined;

  const reviewItems = reviews
    .filter((r) => r.is_approved)
    .slice(0, 5)
    .map((r) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: r.reviewer_name?.trim() || "Customer",
      },
      datePublished: r.created_at,
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      name: r.title ?? undefined,
      reviewBody: r.body ?? undefined,
    }));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: images,
    sku: product.variants?.[0]?.sku,
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand.name,
        }
      : undefined,
    isSimilarTo: product.inspired_by?.trim()
      ? {
          "@type": "Product",
          name: product.inspired_by.trim(),
        }
      : undefined,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "LKR",
      lowPrice: low,
      highPrice: high,
      offerCount: product.variants?.length ?? 1,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/product/${product.slug}`),
    },
    aggregateRating,
    review: reviewItems.length ? reviewItems : undefined,
  };
}

export function brandJsonLd(brand: Brand, products: Product[]) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Brand",
      name: brand.name,
      description: brand.description ?? undefined,
      logo: brand.logo_url ? resolveOgImage(brand.logo_url) : undefined,
      url: absoluteUrl(`/brands/${brand.slug}`),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${brand.name} fragrances`,
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/product/${product.slug}`),
        name: product.name,
      })),
    },
  ];
}
