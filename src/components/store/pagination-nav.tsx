"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  hrefWithPage,
  pageItemRange,
  visiblePages,
} from "@/lib/pagination";
import { cn } from "@/lib/utils";

function controlClass(compact: boolean, disabled = false) {
  return cn(
    "inline-flex items-center justify-center gap-1 border font-medium uppercase tracking-[0.14em]",
    compact
      ? "h-8 px-2 text-[10px] sm:px-2.5"
      : "h-9 px-2.5 text-[10px] sm:h-10 sm:px-3 sm:text-[11px]",
    disabled
      ? "cursor-not-allowed border-border/50 text-muted-foreground/40"
      : "border-border text-muted-foreground transition hover:border-amber/50 hover:text-amber focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber/40",
  );
}

function pageClass(compact: boolean, current = false, pending = false) {
  return cn(
    "inline-flex items-center justify-center tabular-nums tracking-[0.08em]",
    compact ? "size-8 text-[11px]" : "size-9 text-[11px] sm:size-10",
    current
      ? "border border-amber/40 bg-amber/10 text-amber"
      : "text-muted-foreground transition hover:text-amber focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber/40",
    pending && !current && "text-amber",
  );
}

const EMPTY_QUERY: Record<string, string | undefined | null> = {};

export function PaginationNav({
  page,
  pageCount,
  pathname,
  query = EMPTY_QUERY,
  pageKey = "page",
  resultsId = "results",
  total,
  pageSize,
  className,
  compact = false,
}: {
  page: number;
  pageCount: number;
  pathname: string;
  query?: Record<string, string | undefined | null>;
  pageKey?: string;
  resultsId?: string;
  total?: number;
  pageSize?: number;
  className?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pendingPage, setPendingPage] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const queryKey = JSON.stringify(query);
  const busy = isPending || (pendingPage != null && pendingPage !== page);

  const hrefFor = useMemo(() => {
    const q = JSON.parse(queryKey) as Record<string, string | undefined | null>;
    return (p: number) => hrefWithPage(pathname, q, p, pageKey);
  }, [pathname, queryKey, pageKey]);

  const pages = useMemo(
    () => visiblePages(page, pageCount),
    [page, pageCount],
  );

  useEffect(() => {
    setPendingPage(null);
  }, [page, pathname, pageKey]);

  useEffect(() => {
    if (pageCount <= 1) return;
    const hrefs = new Set<string>();
    if (page > 1) hrefs.add(hrefFor(page - 1));
    if (page < pageCount) hrefs.add(hrefFor(page + 1));
    for (const item of pages) {
      if (typeof item === "number" && item !== page) hrefs.add(hrefFor(item));
    }
    hrefs.forEach((href) => {
      try {
        router.prefetch(href);
      } catch {
        /* prefetch is best-effort */
      }
    });
  }, [hrefFor, page, pageCount, pages, router]);

  useEffect(() => {
    const el = document.getElementById(resultsId);
    if (!el) return;
    el.style.transition = "opacity 120ms ease";
    el.style.opacity = busy ? "0.55" : "";
    el.style.pointerEvents = busy ? "none" : "";
    return () => {
      el.style.opacity = "";
      el.style.pointerEvents = "";
    };
  }, [busy, resultsId]);

  if (pageCount <= 1) return null;

  const prev = page > 1 ? hrefFor(page - 1) : null;
  const next = page < pageCount ? hrefFor(page + 1) : null;
  const range =
    total != null && pageSize != null
      ? pageItemRange(page, pageSize, total)
      : null;

  function onPageClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    nextPage: number,
  ) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    if (nextPage === page) return;
    setPendingPage(nextPage);
    document
      .getElementById(resultsId)
      ?.scrollIntoView({ behavior: "auto", block: "start" });
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  return (
    <nav
      aria-label="Pagination"
      aria-busy={busy}
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        compact
          ? "border-t border-border/40 pt-4"
          : "mt-10 border-t border-border/40 pt-6 sm:mt-12 sm:pt-8",
        className,
      )}
    >
      <p className="text-center text-[11px] tabular-nums text-muted-foreground sm:text-left sm:text-xs">
        {range ? (
          <>
            <span className="text-foreground">
              {range.start}–{range.end}
            </span>
            <span> of {range.total}</span>
          </>
        ) : (
          <>
            Page {page} of {pageCount}
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1">
        {prev ? (
          <Link
            href={prev}
            scroll={false}
            prefetch
            rel="prev"
            onClick={(event) => onPageClick(event, prev, page - 1)}
            className={controlClass(compact)}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">Prev</span>
          </Link>
        ) : (
          <span className={controlClass(compact, true)} aria-disabled="true">
            <ChevronLeft className="size-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">Prev</span>
          </span>
        )}

        <ol className="flex items-center gap-0.5">
          {pages.map((item, index) =>
            item === "ellipsis" ? (
              <li
                key={`e-${index}`}
                className={cn(
                  "flex items-center justify-center text-muted-foreground/60",
                  compact ? "size-8" : "size-9 sm:size-10",
                )}
                aria-hidden
              >
                …
              </li>
            ) : (
              <li key={item}>
                {item === page ? (
                  <span
                    className={pageClass(compact, true)}
                    aria-current="page"
                  >
                    {item}
                  </span>
                ) : (
                  <Link
                    href={hrefFor(item)}
                    scroll={false}
                    prefetch
                    onClick={(event) => onPageClick(event, hrefFor(item), item)}
                    className={pageClass(compact, false, pendingPage === item)}
                    aria-label={`Page ${item}`}
                  >
                    {item}
                  </Link>
                )}
              </li>
            ),
          )}
        </ol>

        {next ? (
          <Link
            href={next}
            scroll={false}
            prefetch
            rel="next"
            onClick={(event) => onPageClick(event, next, page + 1)}
            className={controlClass(compact)}
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-3.5" strokeWidth={1.75} />
          </Link>
        ) : (
          <span className={controlClass(compact, true)} aria-disabled="true">
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-3.5" strokeWidth={1.75} />
          </span>
        )}
      </div>
    </nav>
  );
}
