"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  LayoutGrid,
  Package,
  Star,
  Store,
  Tag,
  Users,
} from "lucide-react";
import { SignOutButton } from "@/components/store/sign-out-button";
import { cn } from "@/lib/utils";

const links: {
  href: string;
  label: string;
  short: string;
  icon: typeof LayoutGrid;
  exact?: boolean;
}[] = [
  {
    href: "/admin",
    label: "Overview",
    short: "Home",
    icon: LayoutGrid,
    exact: true,
  },
  { href: "/admin/orders", label: "Orders", short: "Orders", icon: Package },
  {
    href: "/admin/inventory",
    label: "Inventory",
    short: "Stock",
    icon: Boxes,
  },
  { href: "/admin/products", label: "Products", short: "Items", icon: Tag },
  { href: "/admin/brands", label: "Brands", short: "Brands", icon: Store },
  {
    href: "/admin/users",
    label: "Users",
    short: "Users",
    icon: Users,
  },
  { href: "/admin/reviews", label: "Reviews", short: "Reviews", icon: Star },
];

function linkIsActive(pathname: string, link: (typeof links)[number]) {
  return link.exact
    ? pathname === link.href
    : pathname === link.href || pathname.startsWith(`${link.href}/`);
}

function SidebarBrand() {
  return (
    <Link href="/admin" className="flex min-w-0 items-center gap-3 px-1">
      <Image
        src="/brand/spritz-logo.png"
        alt="Spritz Perfumes"
        width={829}
        height={300}
        className="h-8 w-auto max-w-40 object-contain sm:h-9 sm:max-w-44"
      />
      <span className="shrink-0 text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Admin
      </span>
    </Link>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/50 bg-ink lg:flex">
      <div className="flex h-full flex-col px-3 py-5">
        <SidebarBrand />
        <nav aria-label="Admin" className="mt-8 flex-1 overflow-y-auto">
          <ul className="space-y-0.5">
            {links.map((link) => {
              const active = linkIsActive(pathname, link);
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-2.5 px-3 py-2.5 text-xs uppercase tracking-[0.16em] transition",
                      active
                        ? "bg-amber/10 text-amber"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-3.5 shrink-0" aria-hidden />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto space-y-1 border-t border-border/50 pt-4">
          <Link
            href="/"
            className="flex min-h-11 items-center px-3 text-xs uppercase tracking-[0.16em] text-muted-foreground transition hover:text-amber"
          >
            Storefront
          </Link>
          <div className="px-3">
            <SignOutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}

export function AdminMobileHeader() {
  return (
    <div className="sticky top-0 z-40 border-b border-border/50 bg-ink/95 pt-[env(safe-area-inset-top)] backdrop-blur-md lg:hidden">
      <div className="flex h-12 items-center justify-between gap-2 px-3 sm:px-4">
        <Link href="/admin" className="flex min-w-0 items-center gap-2">
          <Image
            src="/brand/spritz-logo.png"
            alt="Spritz Perfumes"
            width={829}
            height={300}
            className="h-7 w-auto max-w-36 object-contain"
          />
          <span className="shrink-0 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Admin
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            href="/"
            className="inline-flex min-h-9 items-center px-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:text-amber"
          >
            Store
          </Link>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="grid grid-cols-7 gap-0.5 px-1 pt-1 sm:px-2">
        {links.map((link) => {
          const active = linkIsActive(pathname, link);
          const Icon = link.icon;
          return (
            <li key={link.href} className="min-w-0">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                title={link.label}
                className={cn(
                  "relative flex min-h-12 flex-col items-center justify-center gap-1 px-0.5 py-2 text-center transition",
                  active
                    ? "bg-amber/10 text-amber"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="max-w-full truncate text-[9px] uppercase tracking-[0.06em] sm:text-[10px] sm:tracking-[0.08em]">
                  {link.short}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
