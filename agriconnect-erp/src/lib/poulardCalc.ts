import type { PoulardMouvement } from "@/types/production"

export function computeEffectifActuel(mouvements: PoulardMouvement[]): number {
  return mouvements.reduce((sum, m) => sum + (m.type === "entree" ? m.quantite : -m.quantite), 0)
}

export function computeEffectifAt(mouvements: PoulardMouvement[], dateIso: string): number {
  return mouvements
    .filter((m) => m.date <= dateIso)
    .reduce((sum, m) => sum + (m.type === "entree" ? m.quantite : -m.quantite), 0)
}

export function sumSurPeriode(mouvements: PoulardMouvement[], type: PoulardMouvement["type"], startIso: string, endIso: string): number {
  return mouvements
    .filter((m) => m.type === type && m.date >= startIso && m.date <= endIso)
    .reduce((sum, m) => sum + m.quantite, 0)
}
