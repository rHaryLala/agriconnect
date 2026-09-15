export type StockLocation = "ferme" | "magasinier" | "store"

export const STOCK_LOCATIONS: StockLocation[] = ["ferme", "magasinier", "store"]

export const DEFAULT_STOCK_LOCATION: StockLocation = "ferme"

export interface StockArticle {
  id: string
  nom: string
  unite: string
  quantiteInitiale: number
  seuilCritique: number
}

export type MovementType = "entree" | "sortie" | "transfert"

export interface StockMovement {
  id: string
  articleId: string
  type: MovementType
  emplacement: StockLocation
  quantite: number
  date: string
  quantiteAnnoncee?: number
  emplacementDestination?: StockLocation
  destinataire?: string
  numeroBon?: string
  montant?: number
  montantRegle?: number
  responsable?: string
  observation: string
}

