"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Package,
  RotateCcw,
  Star,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links: {
  href: string;
  label: string;
  icon: typeof UserRound;
  exact?: boolean;
}[] = [
  { href: "/account", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/returns", label: "Returns", icon: RotateCcw },
  { href: "/account/reviews", label: "Reviews", icon: Star },
  { href: "/account/profile", label: "Profile", icon: UserRound },
];

function linkIsActive(pathname: string, link: (typeof links)[number]) {
  return link.exact
    ? pathname === link.href
    : pathname === link.href || pathname.startsWith(`${link.href}/`);
}

export function AccountNav({
  reviewBadge = 0,
}: {
  reviewBadge?: number;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" className="min-w-0 max-w-full">
      <ul className="grid grid-cols-5 gap-0.5 lg:flex lg:flex-col lg:gap-0.5">
        {links.map((link) => {
          const active = linkIsActive(pathname, link);
          const Icon = link.icon;
          const badge =
            link.href === "/account/reviews" && reviewBadge > 0
              ? reviewBadge
              : null;

          return (
            <li key={link.href} className="min-w-0">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-12 flex-col items-center justify-center gap-1 px-1 py-2 text-center transition lg:min-h-11 lg:flex-row lg:justify-start lg:gap-2 lg:px-3 lg:py-2.5 lg:text-left",
                  active
                    ? "bg-amber/10 text-amber"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0 lg:size-3.5" aria-hidden />
                <span className="max-w-full truncate text-[10px] uppercase tracking-[0.08em] lg:text-xs lg:tracking-[0.14em]">
                  {link.label}
                </span>
                {badge != null ? (
                  <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-amber text-[9px] font-medium text-primary-foreground lg:static lg:ml-auto lg:size-5 lg:text-[10px]">
                    {badge > 9 ? "9+" : badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
