import { DEFAULT_STOCK_LOCATION, STOCK_LOCATIONS, type StockArticle, type StockLocation, type StockMovement } from "@/types/stock"

function movementsFor(article: StockArticle, movements: StockMovement[], location?: StockLocation): StockMovement[] {
  return movements.filter((m) => m.articleId === article.id && (!location || m.emplacement === location))
}

/** Opening stock is held at the farm, so it only counts towards that location. */
function openingStock(article: StockArticle, location?: StockLocation): number {
  return !location || location === DEFAULT_STOCK_LOCATION ? article.quantiteInitiale : 0
}

/** Stock held for an article, farm-wide by default or restricted to one location. */
export function computeCurrentStock(article: StockArticle, movements: StockMovement[], location?: StockLocation): number {
  const forArticle = movementsFor(article, movements, location)
  const entrees = forArticle.filter((m) => m.type === "entree").reduce((sum, m) => sum + m.quantite, 0)
  const sorties = forArticle.filter((m) => m.type === "sortie").reduce((sum, m) => sum + m.quantite, 0)
  return openingStock(article, location) + entrees - sorties
}

export function computeStockByLocation(article: StockArticle, movements: StockMovement[]): Record<StockLocation, number> {
  return STOCK_LOCATIONS.reduce(
    (acc, location) => {
      acc[location] = computeCurrentStock(article, movements, location)
      return acc
    },
    {} as Record<StockLocation, number>
  )
}

export function computeRunningBalances(
  article: StockArticle,
  movements: StockMovement[],
  location?: StockLocation
): Record<string, number> {
  const forArticle = movementsFor(article, movements, location)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))

  let balance = openingStock(article, location)
  const result: Record<string, number> = {}
  for (const m of forArticle) {
    balance += m.type === "entree" ? m.quantite : -m.quantite
    result[m.id] = balance
  }
  return result
}

export type StockStatus = "ok" | "bas" | "critique"

export function getStockStatus(current: number, seuilCritique: number): StockStatus {
  if (current <= seuilCritique) return "critique"
  if (current <= seuilCritique * 1.5) return "bas"
  return "ok"
}