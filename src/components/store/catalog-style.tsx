"use client";

import { Grid3x3, LayoutList } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BrandCard } from "@/components/store/brand-card";
import { ProductCard } from "@/components/store/product-card";
import {
  CATALOG_STYLE_COOKIE,
  DEFAULT_CATALOG_STYLE,
  brandCatalogClass,
  parseCatalogStyle,
  productCatalogClass,
  type CatalogStyle,
} from "@/lib/catalog-style";
import type { Brand, Product, VariantType } from "@/lib/types";
import { cn } from "@/lib/utils";

const OPTIONS: {
  value: CatalogStyle;
  label: string;
  icon: typeof Grid3x3;
}[] = [
  { value: "compact", label: "Compact", icon: Grid3x3 },
  { value: "list", label: "List", icon: LayoutList },
];

type CatalogStyleContextValue = {
  style: CatalogStyle;
  setStyle: (style: CatalogStyle) => void;
};

const CatalogStyleContext = createContext<CatalogStyleContextValue | null>(
  null,
);

function persistStyle(style: CatalogStyle) {
  document.cookie = `${CATALOG_STYLE_COOKIE}=${style}; Path=/; Max-Age=31536000; SameSite=Lax`;
  try {
    localStorage.setItem(CATALOG_STYLE_COOKIE, style);
  } catch {
    /* ignore */
  }
}

export function CatalogStyleProvider({
  initialStyle = DEFAULT_CATALOG_STYLE,
  children,
}: {
  initialStyle?: CatalogStyle;
  children: React.ReactNode;
}) {
  const [style, setStyleState] = useState<CatalogStyle>(initialStyle);

  useEffect(() => {
    try {
      const stored = parseCatalogStyle(
        localStorage.getItem(CATALOG_STYLE_COOKIE),
      );
      if (stored !== initialStyle) {
        setStyleState(stored);
        persistStyle(stored);
      }
    } catch {
      /* ignore */
    }
  }, [initialStyle]);

  const setStyle = useCallback((next: CatalogStyle) => {
    setStyleState(next);
    persistStyle(next);
  }, []);

  const value = useMemo(() => ({ style, setStyle }), [style, setStyle]);

  return (
    <CatalogStyleContext.Provider value={value}>
      {children}
    </CatalogStyleContext.Provider>
  );
}

export function useCatalogStyle() {
  const ctx = useContext(CatalogStyleContext);
  if (!ctx) {
    throw new Error("useCatalogStyle must be used within CatalogStyleProvider");
  }
  return ctx;
}

export function CatalogStyleToggle({ className }: { className?: string }) {
  const { style, setStyle } = useCatalogStyle();

  return (
    <div
      role="group"
      aria-label="Catalog layout"
      className={cn(
        "inline-flex border border-border",
        className,
      )}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = style === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            aria-label={label}
            title={label}
            onClick={() => setStyle(value)}
            className={cn(
              "inline-flex size-11 items-center justify-center transition sm:size-9",
              active
                ? "bg-amber/15 text-amber"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" strokeWidth={1.75} />
          </button>
        );
      })}
    </div>
  );
}

export function CatalogProductResults({
  products,
  preferType,
}: {
  products: Product[];
  preferType?: VariantType;
}) {
  const { style } = useCatalogStyle();

  return (
    <div
      id="results"
      className={cn("scroll-mt-24", productCatalogClass(style))}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          preferType={preferType}
          layout={style === "list" ? "row" : "tile"}
        />
      ))}
    </div>
  );
}

export function CatalogBrandResults({ brands }: { brands: Brand[] }) {
  const { style } = useCatalogStyle();

  return (
    <ul id="results" className={cn("scroll-mt-24", brandCatalogClass(style))}>
      {brands.map((brand) => (
        <li key={brand.id}>
          <BrandCard
            brand={brand}
            layout={style === "list" ? "row" : "tile"}
          />
        </li>
      ))}
    </ul>
  );
}
