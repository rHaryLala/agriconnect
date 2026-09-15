import { DEFAULT_STOCK_LOCATION, STOCK_LOCATIONS, type StockArticle, type StockLocation, type StockMovement } from "@/types/stock"

function movementDelta(movement: StockMovement, location?: StockLocation): number {
  if (movement.type === "transfert") {
    if (!location) return 0
    if (movement.emplacement === location) return -movement.quantite
    if (movement.emplacementDestination === location) return movement.quantite
    return 0
  }
  if (location && movement.emplacement !== location) return 0
  return movement.type === "entree" ? movement.quantite : -movement.quantite
}

function movementsFor(article: StockArticle, movements: StockMovement[]): StockMovement[] {
  return movements.filter((m) => m.articleId === article.id)
}

function openingStock(article: StockArticle, location?: StockLocation): number {
  return !location || location === DEFAULT_STOCK_LOCATION ? article.quantiteInitiale : 0
}

export function computeCurrentStock(article: StockArticle, movements: StockMovement[], location?: StockLocation): number {
  return movementsFor(article, movements).reduce(
    (total, m) => total + movementDelta(m, location),
    openingStock(article, location)
  )
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
  const forArticle = movementsFor(article, movements)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))

  let balance = openingStock(article, location)
  const result: Record<string, number> = {}
  for (const m of forArticle) {
    const delta = movementDelta(m, location)
    balance += delta
    if (delta !== 0 || !location) result[m.id] = balance
  }
  return result
}

export interface LocationDebt {
  from: StockLocation
  to: StockLocation
  montant: number
  regle: number
  reste: number
}

export function computeLocationDebts(movements: StockMovement[]): LocationDebt[] {
  const byPair = new Map<string, LocationDebt>()
  for (const m of movements) {
    if (m.type !== "transfert" || !m.emplacementDestination || !m.montant) continue
    const key = `${m.emplacement}>${m.emplacementDestination}`
    const debt = byPair.get(key) ?? { from: m.emplacement, to: m.emplacementDestination, montant: 0, regle: 0, reste: 0 }
    debt.montant += m.montant
    debt.regle += m.montantRegle ?? 0
    byPair.set(key, debt)
  }
  return [...byPair.values()]
    .map((d) => ({ ...d, reste: d.montant - d.regle }))
    .sort((a, b) => b.reste - a.reste)
}

export function computeReceptionEcart(movement: StockMovement): number | null {
  if (movement.type !== "entree" || movement.quantiteAnnoncee === undefined) return null
  return movement.quantite - movement.quantiteAnnoncee
}

export function computeTransferDue(movement: StockMovement): number {
  return (movement.montant ?? 0) - (movement.montantRegle ?? 0)
}

export type StockStatus = "ok" | "bas" | "critique"

export function getStockStatus(current: number, seuilCritique: number): StockStatus {
  if (current <= seuilCritique) return "critique"
  if (current <= seuilCritique * 1.5) return "bas"
  return "ok"
}
