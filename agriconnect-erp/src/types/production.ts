export interface PouleCageReleve {
  cageId: string
  nbPoules: number
}

export type EggCategory = "gmNormal" | "gmCasse" | "pmNormal" | "pmCasse"

export const EGG_CATEGORIES: EggCategory[] = ["gmNormal", "gmCasse", "pmNormal", "pmCasse"]

export function emptyProduction(): Record<EggCategory, number> {
  return { gmNormal: 0, gmCasse: 0, pmNormal: 0, pmCasse: 0 }
}

export interface PouleEntry {
  id: string
  date: string
  cages: PouleCageReleve[]
  production: Record<EggCategory, number>
  alimentsKg: number
  mortalite: number
  observation: string
}

export interface VacheTraite {
  vacheId: string
  matin: number
  soir: number
}

export interface VacheEntry {
  id: string
  date: string
  traites: VacheTraite[]
  alimentationKg: number
  suiviSanitaire: string
}

export type CycleEtape = "demarrage" | "croissance" | "fin_cycle"

export interface KuroilerEntry {
  id: string
  date: string
  kgViande: number
  poussinsVendus: number
  oeufsProduits: number
  etapeCycle: string
  observation: string
}

export interface CultureEntry {
  id: string
  date: string
  culture: string
  surfaceHa: number
  recolteQty: number
  coutIntrants: number
  intrants: string
}