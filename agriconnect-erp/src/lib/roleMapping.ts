import * as Sentry from "@sentry/react"
import type { UserRole } from "@/types/user"

/**
 * Correspondance 1:1 avec l'enum Role du backend.
 *
 * Les cinq valeurs existent en base depuis la migration du 22/09 : il n'y a
 * plus aucun rôle à dégrader. L'ancienne version renvoyait `magasinier` vers
 * OUVRIER et `controleur_interne` vers COMPTABLE, ce qui rendait ces deux rôles
 * impossibles à attribuer depuis l'interface.
 */
const BACKEND_TO_FRONTEND: Record<string, UserRole> = {
  ADMIN: "admin",
  COMPTABLE: "comptable",
  OUVRIER: "ouvrier",
  MAGASINIER: "magasinier",
  CONTROLEUR_INTERNE: "controleur_interne",
}

const FRONTEND_TO_BACKEND: Record<UserRole, string> = {
  admin: "ADMIN",
  comptable: "COMPTABLE",
  ouvrier: "OUVRIER",
  magasinier: "MAGASINIER",
  controleur_interne: "CONTROLEUR_INTERNE",
}

export function toFrontendRole(backendRole: string): UserRole {
  const mapped = BACKEND_TO_FRONTEND[backendRole]
  if (!mapped) {
    // Un rôle inconnu signifie que le backend a gagné une valeur d'enum que le
    // front ignore. On replie sur le rôle le moins privilégié et on le signale.
    const message = `Rôle backend inconnu "${backendRole}", repli sur "ouvrier".`
    console.warn(`[roleMapping] ${message}`)
    Sentry.captureMessage(message, "warning")
    return "ouvrier"
  }
  return mapped
}

export function toBackendRole(frontendRole: UserRole): string {
  return FRONTEND_TO_BACKEND[frontendRole]
}
