import type { PoulardMouvement } from "@/types/production"

/**
 * Effect of a movement on the head count. Laying records count eggs, not
 * birds, so they leave the flock size untouched.
 */
function effectifDelta(mouvement: PoulardMouvement): number {
  if (mouvement.type === "ponte") return 0
  return mouvement.type === "entree" ? mouvement.quantite : -mouvement.quantite
}

export function computeEffectifActuel(mouvements: PoulardMouvement[]): number {
  return mouvements.reduce((sum, m) => sum + effectifDelta(m), 0)
}

export function computeEffectifAt(mouvements: PoulardMouvement[], dateIso: string): number {
  return mouvements.filter((m) => m.date <= dateIso).reduce((sum, m) => sum + effectifDelta(m), 0)
}

export function sumSurPeriode(mouvements: PoulardMouvement[], type: PoulardMouvement["type"], startIso: string, endIso: string): number {
  return mouvements
    .filter((m) => m.type === type && m.date >= startIso && m.date <= endIso)
    .reduce((sum, m) => sum + m.quantite, 0)
}

/** Breeds present in the flock, in the order they were first recorded. */
export function listRaces(mouvements: PoulardMouvement[]): string[] {
  const races = mouvements
    .filter((m) => m.type === "entree" && m.race)
    .map((m) => m.race as string)
  return [...new Set(races)]
}

/**
 * Weekly laying rate: eggs collected over the period, related to what the
 * flock could lay at one egg per bird per day. Returns a percentage.
 */
export function computeTauxPonteHebdomadaire(mouvements: PoulardMouvement[], startIso: string, endIso: string): number {
  const oeufs = sumSurPeriode(mouvements, "ponte", startIso, endIso)
  const effectif = computeEffectifAt(mouvements, endIso)
  if (effectif <= 0) return 0
  const jours = Math.max(1, Math.round((Date.parse(endIso) - Date.parse(startIso)) / 86_400_000) + 1)
  return (oeufs / (effectif * jours)) * 100
}
