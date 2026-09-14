/** Physical places the farm holds stock in, in circuit order. */
export type StockLocation = "ferme" | "magasinier" | "store"

export const STOCK_LOCATIONS: StockLocation[] = ["ferme", "magasinier", "store"]

/** Opening quantities and legacy movements are held at the farm. */
export const DEFAULT_STOCK_LOCATION: StockLocation = "ferme"

export interface StockArticle {
  id: string
  nom: string
  unite: string
  quantiteInitiale: number
  seuilCritique: number
}

export type MovementType = "entree" | "sortie"

export interface StockMovement {
  id: string
  articleId: string
  type: MovementType
  /** Location the quantity enters or leaves. */
  emplacement: StockLocation
  quantite: number
  date: string
  destinataire?: string
  numeroBon?: string
  montant?: number
  observation: string
}