import type { UserRole } from "@/types/user"

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrateur",
  finance_commercial: "Finance / Commercial",
  operations: "Opérations",
}

export const ROLE_TONES: Record<UserRole, "primary" | "info" | "success"> = {
  admin: "primary",
  finance_commercial: "info",
  operations: "success",
}