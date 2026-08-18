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
  quantite: number
  date: string
  origine: string
}