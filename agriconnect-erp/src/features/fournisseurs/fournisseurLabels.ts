import { Wheat, Stethoscope, Sprout, Fuel, Wrench, Truck, type LucideIcon } from "lucide-react"
import type { FournisseurCategorie } from "@/types/fournisseur"

export const CATEGORIE_LABEL_KEYS: Record<FournisseurCategorie, string> = {
  aliments: "fournisseurs.categories.aliments",
  veterinaire: "fournisseurs.categories.veterinaire",
  intrants: "fournisseurs.categories.intrants",
  carburant: "fournisseurs.categories.carburant",
  materiel: "fournisseurs.categories.materiel",
  transport: "fournisseurs.categories.transport",
}

type BadgeTone = "primary" | "success" | "warning" | "destructive" | "info" | "muted"

export const CATEGORIE_TONES: Record<FournisseurCategorie, BadgeTone> = {
  aliments: "success",
  veterinaire: "info",
  intrants: "primary",
  carburant: "warning",
  materiel: "muted",
  transport: "info",
}

export const CATEGORIE_ICONS: Record<FournisseurCategorie, LucideIcon> = {
  aliments: Wheat,
  veterinaire: Stethoscope,
  intrants: Sprout,
  carburant: Fuel,
  materiel: Wrench,
  transport: Truck,
}

export const PAYMENT_METHOD_LABEL_KEYS: Record<string, string> = {
  especes: "fournisseurs.payments.cash",
  mobile: "fournisseurs.payments.mobile",
  virement: "fournisseurs.payments.transfer",
}
