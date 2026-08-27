import type { UserRole } from "@/types/user"

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrateur",
  comptable: "Comptable",
  ouvrier: "Ouvrier",
}

export const ROLE_TONES: Record<UserRole, "primary" | "info" | "success"> = {
  admin: "primary",
  comptable: "info",
  ouvrier: "success",
}