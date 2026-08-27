import type { UserRole } from "@/types/user"

const BACKEND_TO_FRONTEND: Record<string, UserRole> = {
  ADMIN: "admin",
  COMPTABLE: "comptable",
  OUVRIER: "ouvrier",
}

const FRONTEND_TO_BACKEND: Record<UserRole, string> = {
  admin: "ADMIN",
  comptable: "COMPTABLE",
  ouvrier: "OUVRIER",
}

export function toFrontendRole(backendRole: string): UserRole {
  return BACKEND_TO_FRONTEND[backendRole] ?? "ouvrier"
}

export function toBackendRole(frontendRole: UserRole): string {
  return FRONTEND_TO_BACKEND[frontendRole]
}