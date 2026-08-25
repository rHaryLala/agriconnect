import type { UserRole } from "@/types/user"

const BACKEND_TO_FRONTEND: Record<string, UserRole> = {
  ADMIN: "admin",
  COMPTABLE: "finance_commercial",
  OUVRIER: "ouvrier",
}

const FRONTEND_TO_BACKEND: Record<UserRole, string> = {
  admin: "ADMIN",
  finance_commercial: "COMPTABLE",
  ouvrier: "OUVRIER",
}

export function toFrontendRole(backendRole: string): UserRole {
  return BACKEND_TO_FRONTEND[backendRole] ?? "ouvrier"
}

export function toBackendRole(frontendRole: UserRole): string {
  return FRONTEND_TO_BACKEND[frontendRole]
}