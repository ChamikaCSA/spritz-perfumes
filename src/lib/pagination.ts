export const PAGE_SIZE = {
  shop: 60,
  brand: 60,
  brands: 60,
  admin: 25,
  account: 20,
  reviews: 20,
  inventoryEvents: 40,
} as const;

export const PRODUCT_FETCH_CAP = 2000;

export type PageResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export function parsePage(value?: string | number | null, max = 500) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(Math.floor(n), max);
}

export function pageRange(page: number, pageSize: number) {
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
}

export function emptyPage<T>(page = 1, pageSize: number = PAGE_SIZE.admin): PageResult<T> {
  return { items: [], total: 0, page, pageSize, pageCount: 1 };
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): PageResult<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    pageCount,
  };
}

export function pageFromTotal<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): PageResult<T> {
  const pageCount = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), pageCount);
  return {
    items,
    total,
    page: safePage,
    pageSize,
    pageCount,
  };
}

export function visiblePages(
  page: number,
  pageCount: number,
): Array<number | "ellipsis"> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const keep = new Set<number>([1, pageCount, page - 1, page, page + 1]);
  if (page <= 3) {
    keep.add(2);
    keep.add(3);
    keep.add(4);
  }
  if (page >= pageCount - 2) {
    keep.add(pageCount - 3);
    keep.add(pageCount - 2);
    keep.add(pageCount - 1);
  }

  const nums = [...keep]
    .filter((n) => n >= 1 && n <= pageCount)
    .sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];
  for (let i = 0; i < nums.length; i++) {
    if (i > 0 && nums[i] - nums[i - 1] > 1) items.push("ellipsis");
    items.push(nums[i]);
  }
  return items;
}

export function pageItemRange(page: number, pageSize: number, total: number) {
  if (total <= 0 || pageSize <= 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  if (start > total) return null;
  return { start, end, total };
}

export function hrefWithPage(
  pathname: string,
  current: Record<string, string | undefined | null>,
  page: number,
  pageKey = "page",
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    if (!value || key === pageKey) continue;
    params.set(key, value);
  }
  if (page > 1) params.set(pageKey, String(page));
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
