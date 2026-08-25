"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

const links = [
  { href: "/shop", label: "Shop", match: "/shop" },
  { href: "/brands", label: "Brands", match: "/brands" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { openCart, itemCount, hasHydrated } = useCart();
  const count = hasHydrated ? itemCount() : 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuPathname, setMenuPathname] = useState(pathname);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchId = useId();

  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const id = requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [searchOpen]);

  function onSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") || "").trim();
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Spritz Perfumes home"
          className="relative z-10 shrink-0"
        >
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="block"
          >
            <Image
              src="/brand/spritz-logo.png"
              alt="Spritz Perfumes"
              width={829}
              height={300}
              priority
              className="h-8 w-auto max-w-40 object-contain object-left transition-[filter] duration-300 hover:brightness-125 sm:h-9 sm:max-w-44 lg:h-10 lg:max-w-52"
            />
          </motion.span>
        </Link>

        <nav className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-x-4 lg:flex xl:gap-x-5">
          {links.map((link) => {
            const active =
              link.match != null &&
              (pathname === link.match ||
                pathname.startsWith(`${link.match}/`));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap text-[11px] uppercase tracking-[0.16em] transition-colors hover:text-amber",
                  active ? "text-amber" : "text-muted-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative z-10 ml-auto flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setSearchOpen((o) => !o);
            }}
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-full transition-colors hover:text-amber",
              searchOpen ? "text-amber" : "text-muted-foreground",
            )}
            aria-label={searchOpen ? "Close search" : "Search"}
            aria-expanded={searchOpen}
            aria-controls={searchId}
          >
            <Search className="size-5" />
          </button>
          <Link
            href="/wishlist"
            className="inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-amber"
            aria-label="Wishlist"
          >
            <Heart className="size-5" />
          </Link>
          <Link
            href="/account"
            className="inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-amber"
            aria-label="Account"
          >
            <User className="size-5" />
          </Link>
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-amber"
            aria-label="Open cart"
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-amber text-[10px] font-medium text-primary-foreground">
                {count}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchOpen(false);
              setMenuOpen((o) => !o);
            }}
            className="inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-amber lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            id={searchId}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border/40 bg-background/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8"
          >
            <form
              onSubmit={onSearchSubmit}
              className="mx-auto flex max-w-7xl gap-2"
            >
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  name="q"
                  type="search"
                  placeholder="Search fragrance…"
                  autoComplete="off"
                  className="h-11 w-full border border-border bg-secondary/30 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-amber/40"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center justify-center bg-amber px-5 text-xs uppercase tracking-[0.16em] text-primary-foreground"
              >
                Search
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border/40 bg-background/95 px-4 py-4 backdrop-blur-md lg:hidden sm:px-6"
          >
            <ul className="mx-auto flex max-w-7xl flex-col gap-1">
              {links.map((link) => {
                const active =
                  link.match != null &&
                  (pathname === link.match ||
                    pathname.startsWith(`${link.match}/`));
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "block py-3.5 text-xs uppercase tracking-[0.16em] transition-colors hover:text-amber",
                        active ? "text-amber" : "text-muted-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 sm:h-28"
        aria-hidden
      >
        <div
          className="absolute inset-0 backdrop-blur-md backdrop-saturate-150 mask-[linear-gradient(to_bottom,black_20%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,black_20%,transparent)]"
        />
        <div className="absolute inset-0 bg-linear-to-b from-background/95 via-background/50 to-transparent" />
      </div>
    </header>
  );
}
