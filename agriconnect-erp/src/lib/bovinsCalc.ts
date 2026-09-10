import type { BovinAnimal } from "@/types/production"

export function countEffectifActuel(animaux: BovinAnimal[]): number {
  return animaux.filter((a) => a.statut === "present").length
}

export function countEffectifAt(animaux: BovinAnimal[], dateIso: string): number {
  return animaux.filter((a) => {
    if (a.dateEntree > dateIso) return false
    if (a.dateSortie && a.dateSortie <= dateIso) return false
    return true
  }).length
}

export function countEntreesSurPeriode(animaux: BovinAnimal[], startIso: string, endIso: string): number {
  return animaux.filter((a) => a.dateEntree >= startIso && a.dateEntree <= endIso).length
}

export function countSortiesSurPeriode(animaux: BovinAnimal[], type: "vente" | "deces", startIso: string, endIso: string): number {
  return animaux.filter((a) => a.typeSortie === type && a.dateSortie && a.dateSortie >= startIso && a.dateSortie <= endIso).length
}
