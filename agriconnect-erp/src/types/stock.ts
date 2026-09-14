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

export type MovementType = "entree" | "sortie" | "transfert"

export interface StockMovement {
  id: string
  articleId: string
  type: MovementType
  /** Location the quantity enters or leaves. */
  emplacement: StockLocation
  quantite: number
  date: string
  /** Receiving location, required for a transfer. */
  emplacementDestination?: StockLocation
  destinataire?: string
  numeroBon?: string
  /** Sale amount for an exit, value of the goods moved for a transfer. */
  montant?: number
  /** Part of a transfer debt already settled by the receiving location. */
  montantRegle?: number
  responsable?: string
  observation: string
}

export function isTransfer(movement: StockMovement): boolean {
  return movement.type === "transfert"
}