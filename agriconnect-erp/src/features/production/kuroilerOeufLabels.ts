import type { KuroilerOeufMouvementType } from "@/types/production"

export const KUROILER_OEUF_TYPE_LABEL_KEYS: Record<KuroilerOeufMouvementType, string> = {
  entree: "production.kuroiler.eggs.typeEntry",
  vente: "production.kuroiler.eggs.typeSale",
  couveuse: "production.kuroiler.eggs.typeIncubator",
}

export const KUROILER_OEUF_TYPE_TONES: Record<KuroilerOeufMouvementType, "success" | "info" | "warning"> = {
  entree: "success",
  vente: "info",
  couveuse: "warning",
}
