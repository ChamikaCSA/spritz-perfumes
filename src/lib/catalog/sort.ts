import type { ProductSort, ProductSortOrder } from "@/types";

export function defaultSortOrder(sort: ProductSort = "name"): ProductSortOrder {
  return sort === "name" || sort === "price" ? "asc" : "desc";
}
