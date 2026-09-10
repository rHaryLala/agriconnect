import type { RizRecolte, RizSechageEvent, RizDecorticage, RizVente } from "@/types/production"

export function computeStockPaddyBrut(recoltes: RizRecolte[], sechageEvents: RizSechageEvent[]): number {
  const entrees = recoltes.reduce((sum, r) => sum + r.quantiteKg, 0)
  const finalisations = sechageEvents.filter((e) => e.type === "finalisation").reduce((sum, e) => sum + (e.quantiteKg ?? 0), 0)
  return entrees - finalisations
}

export function computeStockPaddySeche(sechageEvents: RizSechageEvent[], decorticages: RizDecorticage[]): number {
  const finalisations = sechageEvents.filter((e) => e.type === "finalisation").reduce((sum, e) => sum + (e.quantiteKg ?? 0), 0)
  const utilise = decorticages.reduce((sum, d) => sum + d.quantitePaddyKg, 0)
  return finalisations - utilise
}

export function computeStockRizDecortique(decorticages: RizDecorticage[], ventes: RizVente[]): number {
  const produit = decorticages.reduce((sum, d) => sum + d.quantiteRizKg, 0)
  const vendu = ventes.reduce((sum, v) => sum + v.quantiteKg, 0)
  return produit - vendu
}
