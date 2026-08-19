export interface PouleEntry {
  id: string
  date: string
  nbPoules: number
  oeufsJour: number
  alimentsKg: number
  mortalite: number
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
  etapeCycle: CycleEtape
}
export interface CultureEntry {
  id: string
  date: string
  culture: string
  surfaceHa: number
  semisQty: number
  recolteQty: number
  intrants: string
}