import type { CarburantMouvement, CarburantMouvementType } from "@/types/production"

export function inPeriode(mouvement: CarburantMouvement, startIso: string, endIso: string): boolean {
  return mouvement.date >= startIso && mouvement.date <= endIso
}

export function computeStockCarburant(mouvements: CarburantMouvement[]): number {
  return mouvements.reduce((sum, m) => sum + (m.type === "entree" ? m.quantiteLitres : -m.quantiteLitres), 0)
}

export function sumSurPeriode(
  mouvements: CarburantMouvement[],
  type: CarburantMouvementType,
  startIso: string,
  endIso: string
): number {
  return mouvements
    .filter((m) => m.type === type && inPeriode(m, startIso, endIso))
    .reduce((sum, m) => sum + m.quantiteLitres, 0)
}

export interface EnginConsommation {
  engin: string
  litres: number
  sorties: number
}

export function consommationParEngin(mouvements: CarburantMouvement[], startIso: string, endIso: string): EnginConsommation[] {
  const byEngin = new Map<string, EnginConsommation>()
  for (const mouvement of mouvements) {
    if (mouvement.type !== "sortie" || !inPeriode(mouvement, startIso, endIso)) continue
    const engin = mouvement.engin || "—"
    const total = byEngin.get(engin) ?? { engin, litres: 0, sorties: 0 }
    total.litres += mouvement.quantiteLitres
    total.sorties += 1
    byEngin.set(engin, total)
  }
  return [...byEngin.values()].sort((a, b) => b.litres - a.litres)
}
