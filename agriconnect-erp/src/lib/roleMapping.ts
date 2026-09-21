import * as Sentry from "@sentry/react"
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
  magasinier: "OUVRIER",
  controleur_interne: "COMPTABLE",
}

// L'enum Role du backend n'a que 3 valeurs (ADMIN/COMPTABLE/OUVRIER) alors que le
// frontend en gère 5 : magasinier et controleur_interne sont dégradés vers un rôle
// existant, ce qui leur fait perdre des permissions une fois relus depuis l'API.
// Tant que l'enum backend n'est pas étendu (voir rapport d'audit backend), on
// échoue bruyamment pour que cette perte de permission ne passe pas inaperçue.
const DEGRADED_ROLES: Partial<Record<UserRole, string>> = {
  magasinier: "OUVRIER",
  controleur_interne: "COMPTABLE",
}

function warnVisibly(message: string): void {
  console.warn(`[roleMapping] ${message}`)
  Sentry.captureMessage(message, "warning")
}

export function toFrontendRole(backendRole: string): UserRole {
  const mapped = BACKEND_TO_FRONTEND[backendRole]
  if (!mapped) {
    warnVisibly(`Rôle backend inconnu "${backendRole}", repli sur "ouvrier".`)
    return "ouvrier"
  }
  return mapped
}

export function toBackendRole(frontendRole: UserRole): string {
  const degradedTo = DEGRADED_ROLES[frontendRole]
  if (degradedTo) {
    warnVisibly(`Rôle "${frontendRole}" non représentable côté backend, dégradé en "${degradedTo}" : permissions potentiellement perdues au prochain chargement depuis l'API.`)
  }
  return FRONTEND_TO_BACKEND[frontendRole]
}
