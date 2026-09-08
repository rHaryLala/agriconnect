import type { UserRole } from "@/types/user"

export const ROLE_LABEL_KEYS: Record<UserRole, string> = {
  admin: "settings.users.roleAdmin",
  comptable: "settings.users.roleComptable",
  ouvrier: "settings.users.roleOuvrier",
  magasinier: "settings.users.roleMagasinier",
  controleur_interne: "settings.users.roleControleurInterne",
}

export const ROLE_TONES: Record<UserRole, "primary" | "info" | "success" | "warning"> = {
  admin: "primary",
  comptable: "info",
  ouvrier: "success",
  magasinier: "warning",
  controleur_interne: "info",
}