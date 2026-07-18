"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

const links = [
  { href: "/shop", label: "Shop", match: "/shop" },
  { href: "/brands", label: "Brands", match: "/brands" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { openCart, itemCount, hasHydrated } = useCart();
  const count = hasHydrated ? itemCount() : 0;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Spritz Perfumes home"
          className="shrink-0"
        >
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="block"
          >
            <Image
              src="/brand/logo-amber.png"
              alt="Spritz Perfumes"
              width={220}
              height={220}
              priority
              className="h-12 w-auto object-contain transition-[filter] duration-300 hover:brightness-125 sm:h-14 lg:h-16"
            />
          </motion.span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-x-4 lg:flex xl:gap-x-5">
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

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
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
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-amber lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border/40 bg-background/95 px-4 py-4 backdrop-blur-md lg:hidden sm:px-6"
          >
            <ul className="mx-auto flex max-w-6xl flex-col gap-1">
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

      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-20 bg-gradient-to-b from-background/95 to-transparent sm:h-24" />
    </header>
  );
}
