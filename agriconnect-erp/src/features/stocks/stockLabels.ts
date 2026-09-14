import type { StockLocation } from "@/types/stock"

export const STOCK_LOCATION_LABEL_KEYS: Record<StockLocation, string> = {
  ferme: "stock.locations.ferme",
  magasinier: "stock.locations.magasinier",
  store: "stock.locations.store",
}

export const STOCK_LOCATION_TONES: Record<StockLocation, "primary" | "info" | "warning"> = {
  ferme: "primary",
  magasinier: "warning",
  store: "info",
}
