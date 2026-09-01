import type { UserRole } from "@/types/user"

export const ROLE_LABEL_KEYS: Record<UserRole, string> = {
  admin: "settings.users.roleAdmin",
  comptable: "settings.users.roleComptable",
  ouvrier: "settings.users.roleOuvrier",
}

export const ROLE_TONES: Record<UserRole, "primary" | "info" | "success"> = {
  admin: "primary",
  comptable: "info",
  ouvrier: "success",
}