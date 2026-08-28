import type { CultureEntry } from "@/types/production"
import type { StockArticle, StockMovement } from "@/types/stock"
import { computeCurrentStock, getStockStatus } from "@/lib/stockCalc"

function monthKey(date: string) {
  return date.slice(0, 7)
}

export interface HarvestTrend {
  currentTotal: number
  previousTotal: number
  changePercent: number
}

export function computeHarvestTrend(cultures: CultureEntry[]): HarvestTrend {
  const now = new Date()
  const currentMonth = now.toISOString().slice(0, 7)
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7)

  const currentTotal = cultures.filter((c) => monthKey(c.date) === currentMonth).reduce((sum, c) => sum + c.recolteQty, 0)
  const previousTotal = cultures.filter((c) => monthKey(c.date) === previousMonth).reduce((sum, c) => sum + c.recolteQty, 0)
  const changePercent = previousTotal === 0 ? 0 : ((currentTotal - previousTotal) / previousTotal) * 100

  return { currentTotal, previousTotal, changePercent }
}

export interface HarvestMonthPoint {
  mois: string
  recolte: number
}

export function computeMonthlyHarvestSeries(cultures: CultureEntry[]): HarvestMonthPoint[] {
  const byMonth = new Map<string, number>()
  for (const c of cultures) {
    const key = monthKey(c.date)
    byMonth.set(key, (byMonth.get(key) ?? 0) + c.recolteQty)
  }
  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mois, recolte]) => ({ mois, recolte }))
}

export interface StockAlertsSummary {
  critiqueCount: number
  basCount: number
  worstArticle: { nom: string; current: number; unite: string; seuilCritique: number } | null
}

export function computeStockAlertsSummary(articles: StockArticle[], movements: StockMovement[]): StockAlertsSummary {
  let critiqueCount = 0
  let basCount = 0
  let worstArticle: StockAlertsSummary["worstArticle"] = null

  for (const article of articles) {
    const current = computeCurrentStock(article, movements)
    const status = getStockStatus(current, article.seuilCritique)
    if (status === "critique") {
      critiqueCount += 1
      if (!worstArticle) worstArticle = { nom: article.nom, current, unite: article.unite, seuilCritique: article.seuilCritique }
    } else if (status === "bas") {
      basCount += 1
      if (!worstArticle) worstArticle = { nom: article.nom, current, unite: article.unite, seuilCritique: article.seuilCritique }
    }
  }

  return { critiqueCount, basCount, worstArticle }
}

export function computeMovementsLastDays(movements: StockMovement[], days: number): number {
  const now = Date.now()
  return movements.filter((m) => (now - new Date(m.date).getTime()) / (1000 * 60 * 60 * 24) <= days).length
}