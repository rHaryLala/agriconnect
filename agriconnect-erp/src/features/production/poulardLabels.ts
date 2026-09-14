import type { PoulardMouvementType } from "@/types/production"

export const POULARD_TYPE_LABEL_KEYS: Record<PoulardMouvementType, string> = {
  entree: "production.poulard.typeEntree",
  vente: "production.poulard.typeVente",
  mortalite: "production.poulard.typeMortalite",
  ponte: "production.poulard.typePonte",
}
