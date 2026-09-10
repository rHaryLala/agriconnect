import type { HaricotMouvement, HaricotVariante, HaricotMouvementType } from "@/types/production"

export function computeStock(mouvements: HaricotMouvement[], variante: HaricotVariante): number {
  return mouvements
    .filter((m) => m.variante === variante)
    .reduce((sum, m) => sum + (m.type === "entree" ? m.quantiteKg : -m.quantiteKg), 0)
}

export function sumSurPeriode(mouvements: HaricotMouvement[], type: HaricotMouvementType, startIso: string, endIso: string): number {
  return mouvements
    .filter((m) => m.type === type && m.date >= startIso && m.date <= endIso)
    .reduce((sum, m) => sum + m.quantiteKg, 0)
}
