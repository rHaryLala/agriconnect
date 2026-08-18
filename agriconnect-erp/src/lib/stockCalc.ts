import type { StockArticle, StockMovement } from "@/types/stock"

export function computeCurrentStock(article: StockArticle, movements: StockMovement[]): number {
  const forArticle = movements.filter((m) => m.articleId === article.id)
  const entrees = forArticle.filter((m) => m.type === "entree").reduce((sum, m) => sum + m.quantite, 0)
  const sorties = forArticle.filter((m) => m.type === "sortie").reduce((sum, m) => sum + m.quantite, 0)
  return article.quantiteInitiale + entrees - sorties
}

export type StockStatus = "ok" | "bas" | "critique"

export function getStockStatus(current: number, seuilCritique: number): StockStatus {
  if (current <= seuilCritique) return "critique"
  if (current <= seuilCritique * 1.5) return "bas"
  return "ok"
}