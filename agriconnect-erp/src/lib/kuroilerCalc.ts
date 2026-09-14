import type { KuroilerOeufMouvement, KuroilerPoule, KuroilerPouleStatut, KuroilerPouleSuivi } from "@/types/production"

export function countPoulesActives(poules: KuroilerPoule[]): number {
  return poules.filter((p) => p.statut === "active").length
}

export function countPoulesByStatut(poules: KuroilerPoule[], statut: KuroilerPouleStatut): number {
  return poules.filter((p) => p.statut === statut).length
}

/** Share of the live flock that is currently laying. */
export function computeTauxPonte(poules: KuroilerPoule[]): number {
  const actives = poules.filter((p) => p.statut === "active")
  if (actives.length === 0) return 0
  return (actives.filter((p) => p.ponte).length / actives.length) * 100
}

export function latestSuivi(suivis: KuroilerPouleSuivi[], pouleId: string): KuroilerPouleSuivi | undefined {
  return suivis
    .filter((s) => s.pouleId === pouleId)
    .reduce<KuroilerPouleSuivi | undefined>((latest, s) => (!latest || s.date > latest.date ? s : latest), undefined)
}

/** Average of the latest recorded weight across live hens, in kilograms. */
export function computePoidsMoyen(poules: KuroilerPoule[], suivis: KuroilerPouleSuivi[]): number {
  const poids = poules
    .filter((p) => p.statut === "active")
    .map((p) => latestSuivi(suivis, p.id)?.poidsKg)
    .filter((v): v is number => v !== undefined)
  if (poids.length === 0) return 0
  return poids.reduce((sum, v) => sum + v, 0) / poids.length
}

export function sumOeufsSurPeriode(
  mouvements: KuroilerOeufMouvement[],
  type: KuroilerOeufMouvement["type"],
  startIso: string,
  endIso: string
): number {
  return mouvements
    .filter((m) => m.type === type && m.date >= startIso && m.date <= endIso)
    .reduce((sum, m) => sum + m.quantite, 0)
}

/** Kuroiler eggs on hand: what came in, less what was sold or set in the incubator. */
export function computeStockOeufsKuroiler(mouvements: KuroilerOeufMouvement[]): number {
  return mouvements.reduce((sum, m) => sum + (m.type === "entree" ? m.quantite : -m.quantite), 0)
}

export function countOeufsEnCouveuse(mouvements: KuroilerOeufMouvement[]): number {
  return mouvements.filter((m) => m.type === "couveuse").reduce((sum, m) => sum + m.quantite, 0)
}
