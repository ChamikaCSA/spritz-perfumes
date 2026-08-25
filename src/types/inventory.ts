import type { Product } from "./catalog";

export type LotStatus = "sealed" | "open" | "depleted";
export type InventoryEventKind =
  | "receive"
  | "open"
  | "adjust"
  | "loss"
  | "sample"
  | "sale";

export type InventoryLot = {
  id: string;
  product_id: string;
  fill_ml: number;
  remaining_ml: number;
  status: LotStatus;
  cost_lkr: number | null;
  notes: string | null;
  received_at: string;
  product?: Product;
};

export type InventoryEvent = {
  id: string;
  lot_id: string | null;
  product_id: string;
  kind: InventoryEventKind;
  delta_ml: number;
  note: string | null;
  created_by: string | null;
  created_at: string;
};

export type StockSummary = {
  sealedBottles: number;
  openMl: number;
};
