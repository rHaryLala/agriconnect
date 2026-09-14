import type { VacheEntry } from "@/types/production"

export function totalMatin(entry: VacheEntry): number {
  return entry.traites.reduce((sum, t) => sum + t.matin, 0)
}

export function totalSoir(entry: VacheEntry): number {
  return entry.traites.reduce((sum, t) => sum + t.soir, 0)
}

/** Herd output for one day, both milkings combined. */
export function totalJour(entry: VacheEntry): number {
  return totalMatin(entry) + totalSoir(entry)
}

export function totalTroupeau(entries: VacheEntry[]): number {
  return entries.reduce((sum, e) => sum + totalJour(e), 0)
}

export interface VacheTotals {
  vacheId: string
  matin: number
  soir: number
  total: number
}

/** Cumulated output of a single cow over the given entries. */
export function totalsForVache(entries: VacheEntry[], vacheId: string): VacheTotals {
  return entries.reduce<VacheTotals>(
    (acc, entry) => {
      const traite = entry.traites.find((t) => t.vacheId === vacheId)
      if (!traite) return acc
      return { vacheId, matin: acc.matin + traite.matin, soir: acc.soir + traite.soir, total: acc.total + traite.matin + traite.soir }
    },
    { vacheId, matin: 0, soir: 0, total: 0 }
  )
}
