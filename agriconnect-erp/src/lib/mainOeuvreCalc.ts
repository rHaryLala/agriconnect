import type { MainOeuvreEntry } from "@/types/production"

export function inPeriode(entry: MainOeuvreEntry, startIso: string, endIso: string): boolean {
  return entry.date >= startIso && entry.date <= endIso
}

export function totalJoursHomme(entries: MainOeuvreEntry[], startIso: string, endIso: string): number {
  return entries.filter((e) => inPeriode(e, startIso, endIso)).reduce((sum, e) => sum + e.nbEmployes, 0)
}

export interface ActiviteTotal {
  activite: string
  joursHomme: number
  jours: number
}

export function totauxParActivite(entries: MainOeuvreEntry[], startIso: string, endIso: string): ActiviteTotal[] {
  const byActivite = new Map<string, ActiviteTotal>()
  for (const entry of entries) {
    if (!inPeriode(entry, startIso, endIso)) continue
    const total = byActivite.get(entry.activite) ?? { activite: entry.activite, joursHomme: 0, jours: 0 }
    total.joursHomme += entry.nbEmployes
    total.jours += 1
    byActivite.set(entry.activite, total)
  }
  return [...byActivite.values()].sort((a, b) => b.joursHomme - a.joursHomme)
}

export function moyenneEmployesParJour(entries: MainOeuvreEntry[], startIso: string, endIso: string): number {
  const inRange = entries.filter((e) => inPeriode(e, startIso, endIso))
  const jours = new Set(inRange.map((e) => e.date)).size
  if (jours === 0) return 0
  return inRange.reduce((sum, e) => sum + e.nbEmployes, 0) / jours
}
