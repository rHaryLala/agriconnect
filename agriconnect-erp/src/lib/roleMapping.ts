// src/lib/roleMapping.ts
import type { UserRole } from "@/types/user"

const BACKEND_TO_FRONTEND: Record<string, UserRole> = {
  ADMIN: "admin",
  COMPTABLE: "comptable",
  OUVRIER: "ouvrier",
}

//Le backend n'a que ADMIN/COMPTABLE/OUVRIER — magasinier et controleur_interne
// n'existent pas côté serveur. Mapping de repli documenté, à corriger dès que
// l'enum Role backend sera étendu (point à soumettre au dev backend).
const FRONTEND_TO_BACKEND: Record<UserRole, string> = {
  admin: "ADMIN",
  comptable: "COMPTABLE",
  ouvrier: "OUVRIER",
  magasinier: "OUVRIER",
  controleur_interne: "COMPTABLE",
}

export function toFrontendRole(backendRole: string): UserRole {
  return BACKEND_TO_FRONTEND[backendRole] ?? "ouvrier"
}

export function toBackendRole(frontendRole: UserRole): string {
  return FRONTEND_TO_BACKEND[frontendRole]
}