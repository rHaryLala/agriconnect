export interface PouleCageReleve {
  cageId: string
  nbPoules: number
}

export interface PouleEntry {
  id: string
  date: string
  cages: PouleCageReleve[]
  oeufsProduits: number
  oeufsCasses: number
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