import { EGG_CATEGORIES, type EggCategory, type PouleEntry } from "@/types/production"

export function totalOeufs(production: Record<EggCategory, number>): number {
  return EGG_CATEGORIES.reduce((sum, cat) => sum + (production[cat] ?? 0), 0)
}

export function totalOeufsNormaux(production: Record<EggCategory, number>): number {
  return production.gmNormal + production.pmNormal
}

export function totalOeufsCasses(production: Record<EggCategory, number>): number {
  return production.gmCasse + production.pmCasse
}

export function totalPoules(entry: PouleEntry): number {
  return entry.cages.reduce((sum, c) => sum + c.nbPoules, 0)
}

export function emptyProduction(): Record<EggCategory, number> {
  return { gmNormal: 0, gmCasse: 0, pmNormal: 0, pmCasse: 0 }
}

export function estimateValue(production: Record<EggCategory, number>, prices: Record<EggCategory, number>): number {
  return EGG_CATEGORIES.reduce((sum, cat) => sum + (production[cat] ?? 0) * (prices[cat] ?? 0), 0)
}