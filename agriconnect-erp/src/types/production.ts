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

export type KuroilerPouleStatut = "active" | "vendue" | "morte" | "perdue"
export const KUROILER_POULE_STATUTS: KuroilerPouleStatut[] = ["active", "vendue", "morte", "perdue"]

export interface KuroilerPoule {
  id: string
  bracelet: string
  dateEntree: string
  ageMois: number
  ponte: boolean
  statut: KuroilerPouleStatut
  dateSortie?: string
  observation: string
}

export interface KuroilerPouleSuivi {
  id: string
  pouleId: string
  date: string
  poidsKg: number
  vaccin: string
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

export interface MainOeuvreEntry {
  id: string
  date: string
  activite: string
  nbEmployes: number
  observation: string
}

export interface EngraisApplication {
  id: string
  date: string
  culture: string
  typeEngrais: string
  quantiteKg: number
  parcelle: string
  observation: string
}

export type CarburantMouvementType = "entree" | "sortie"
export const CARBURANT_MOUVEMENT_TYPES: CarburantMouvementType[] = ["entree", "sortie"]

export interface CarburantMouvement {
  id: string
  date: string
  type: CarburantMouvementType
  quantiteLitres: number
  engin: string
  observation: string
}

export type BovinGenre = "male" | "femelle"
export type BovinEntreeType = "achat" | "naissance"
export type BovinSortieType = "vente" | "deces"
export type BovinStatut = "present" | "vendu" | "mort"

export type BovinProductivite = "productive" | "taris"
export const BOVIN_PRODUCTIVITES: BovinProductivite[] = ["productive", "taris"]

export type BovinEtat = "gestante" | "mampinono" | "non_gestant" | "tsy_mampinono"
export const BOVIN_ETATS: BovinEtat[] = ["gestante", "mampinono", "non_gestant", "tsy_mampinono"]

export interface BovinAnimal {
  id: string
  identifiant: string
  genre: BovinGenre
  race: string
  type: string
  productivite?: BovinProductivite
  etat?: BovinEtat
  dateEntree: string
  typeEntree: BovinEntreeType
  statut: BovinStatut
  dateSortie?: string
  typeSortie?: BovinSortieType
  clientId?: string
  prixVente?: number
  signataire?: string
  observation: string
}

export type KuroilerOeufMouvementType = "entree" | "vente" | "couveuse"
export const KUROILER_OEUF_MOUVEMENT_TYPES: KuroilerOeufMouvementType[] = ["entree", "vente", "couveuse"]

export interface KuroilerOeufMouvement {
  id: string
  date: string
  type: KuroilerOeufMouvementType
  quantite: number
  clientId?: string
  prixUnitaire?: number
  paymentMethod?: ProductionPaymentMethod
  invoiceId?: string
  observation: string
}

export type PoulardMouvementType = "entree" | "vente" | "mortalite" | "ponte"
export const POULARD_MOUVEMENT_TYPES: PoulardMouvementType[] = ["entree", "vente", "mortalite", "ponte"]

export interface PoulardMouvement {
  id: string
  date: string
  type: PoulardMouvementType
  quantite: number
  race?: string
  clientId?: string
  prixUnitaire?: number
  invoiceId?: string
  observation: string
}

export interface RizRecolte {
  id: string
  date: string
  sacs: number
  quantiteKg: number
  transport: string
  conducteur: string
  magasinier: string
  observation: string
}

export type RizSechageType = "passage" | "finalisation"

export interface RizSechageEvent {
  id: string
  date: string
  type: RizSechageType
  quantiteSortie?: number
  quantiteRetournee?: number
  sacs?: number
  quantiteKg?: number
  observation: string
}

export interface RizDecorticage {
  id: string
  date: string
  quantitePaddyKg: number
  quantiteRizKg: number
  observation: string
}

export type ProductionPaymentMethod = "comptant" | "commande" | "salaire"

export interface RizVente {
  id: string
  date: string
  quantiteKg: number
  clientId: string
  prixUnitaire: number
  paymentMethod: ProductionPaymentMethod
  invoiceId?: string
  observation: string
}

export type HaricotVariante = "blanc" | "rouge"
export type HaricotMouvementType = "entree" | "vente"

export interface HaricotMouvement {
  id: string
  date: string
  variante: HaricotVariante
  type: HaricotMouvementType
  quantiteKg: number
  clientId?: string
  prixUnitaire?: number
  paymentMethod?: ProductionPaymentMethod
  invoiceId?: string
  observation: string
}
