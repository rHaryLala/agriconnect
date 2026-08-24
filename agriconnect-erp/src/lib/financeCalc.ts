import type { FinanceTransaction } from "@/types/finance"

export function computeTotals(transactions: FinanceTransaction[]) {
  const totalRecettes = transactions.filter((t) => t.type === "recette").reduce((sum, t) => sum + t.montant, 0)
  const totalDepenses = transactions.filter((t) => t.type === "depense").reduce((sum, t) => sum + t.montant, 0)
  return { totalRecettes, totalDepenses, marge: totalRecettes - totalDepenses }
}

export interface MonthlyPoint {
  mois: string // "AAAA-MM"
  recettes: number
  depenses: number
}

export function computeMonthlySeries(transactions: FinanceTransaction[]): MonthlyPoint[] {
  const byMonth = new Map<string, MonthlyPoint>()
  for (const t of transactions) {
    const mois = t.date.slice(0, 7)
    if (!byMonth.has(mois)) byMonth.set(mois, { mois, recettes: 0, depenses: 0 })
    const point = byMonth.get(mois)!
    if (t.type === "recette") point.recettes += t.montant
    else point.depenses += t.montant
  }
  return Array.from(byMonth.values()).sort((a, b) => a.mois.localeCompare(b.mois))
}