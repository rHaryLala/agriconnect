import type { BovinEtat, BovinProductivite } from "@/types/production"

export const BOVIN_PRODUCTIVITE_LABEL_KEYS: Record<BovinProductivite, string> = {
  productive: "production.bovins.productiviteProductive",
  taris: "production.bovins.productiviteTaris",
}

export const BOVIN_PRODUCTIVITE_TONES: Record<BovinProductivite, "success" | "muted"> = {
  productive: "success",
  taris: "muted",
}

export const BOVIN_ETAT_LABEL_KEYS: Record<BovinEtat, string> = {
  gestante: "production.bovins.etatGestante",
  mampinono: "production.bovins.etatMampinono",
  non_gestant: "production.bovins.etatNonGestant",
  tsy_mampinono: "production.bovins.etatTsyMampinono",
}

export const BOVIN_ETAT_TONES: Record<BovinEtat, "primary" | "info" | "muted" | "warning"> = {
  gestante: "primary",
  mampinono: "info",
  non_gestant: "muted",
  tsy_mampinono: "warning",
}
