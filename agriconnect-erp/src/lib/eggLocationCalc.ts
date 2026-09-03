import { EGG_CATEGORIES, emptyProduction, type PouleEntry } from "@/types/production"
import type { EggLocation, EggTransfer } from "@/types/eggLocation"

export function computeLocationStock(location: EggLocation, pouleEntries: PouleEntry[], transfers: EggTransfer[]): Record<import("@/types/production").EggCategory, number> {
  const stock = emptyProduction()

  if (location === "ferme") {
    for (const entry of pouleEntries) {
      for (const cat of EGG_CATEGORIES) stock[cat] += entry.production[cat]
    }
  }

  for (const transfer of transfers) {
    if (transfer.from === location) {
      for (const cat of EGG_CATEGORIES) stock[cat] -= transfer.quantities[cat]
    }
    if (transfer.to === location) {
      for (const cat of EGG_CATEGORIES) stock[cat] += transfer.quantities[cat]
    }
  }

  return stock
}

export function totalStock(stock: Record<import("@/types/production").EggCategory, number>): number {
  return EGG_CATEGORIES.reduce((sum, cat) => sum + stock[cat], 0)
}