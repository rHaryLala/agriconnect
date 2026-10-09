import { apiFetch } from "@/lib/apiClient"
import { withMockFallback } from "@/lib/apiFallback"
import type { Employe } from "@/types/personnel"
import { SEED_EMPLOYES } from "./mockPersonnelData"

/**
 * Adaptation personnel. Deux écarts de contrat :
 * - le front porte un seul champ `nom`, le backend `firstName` + `lastName` ;
 * - `statut` n'existe pas sur Employee (seul User a un status). Les fiches
 *   remontent donc toujours « actif ».
 */

interface BackendEmployee {
  id: string
  firstName: string
  lastName: string
  matricule: string | null
  department: string | null
  position: string | null
  phone: string | null
  clientId: string | null
}

/** Premier mot = prénom, le reste = nom. Seul découpage possible sans champ dédié. */
function decouperNom(nom: string): { firstName: string; lastName: string } {
  const mots = nom.trim().split(/\s+/)
  return { firstName: mots[0] ?? "", lastName: mots.slice(1).join(" ") || (mots[0] ?? "") }
}

function versFront(e: BackendEmployee): Employe {
  return {
    id: e.id,
    nom: `${e.firstName} ${e.lastName}`.trim(),
    fonction: e.position ?? "",
    departement: e.department ?? "",
    telephone: e.phone ?? undefined,
    matriculeUaz: e.matricule ?? undefined,
    clientId: e.clientId ?? undefined,
    // Employee n'a pas de colonne de statut : on n'invente pas d'inactif.
    statut: "actif",
  }
}

function corps(data: Omit<Employe, "id">) {
  // `statut` et `clientId` ne sont pas envoyés : absents du DTO, et lier un
  // client est une route dédiée (POST /employees/:id/link-client).
  const { firstName, lastName } = decouperNom(data.nom)
  return {
    firstName,
    lastName,
    matricule: data.matriculeUaz || undefined,
    department: data.departement || undefined,
    position: data.fonction || undefined,
    phone: data.telephone || undefined,
  }
}

export function fetchEmployes(token: string): Promise<Employe[]> {
  return withMockFallback(
    "personnel",
    async () => (await apiFetch<BackendEmployee[]>("/employees", { token })).map(versFront),
    async () => SEED_EMPLOYES,
  )
}

export function createEmploye(token: string, data: Omit<Employe, "id">): Promise<Employe> {
  return withMockFallback(
    "personnel",
    async () => versFront(await apiFetch<BackendEmployee>("/employees", { method: "POST", token, body: corps(data) })),
    async () => ({ ...data, id: crypto.randomUUID() }),
  )
}

export function updateEmploye(token: string, id: string, data: Omit<Employe, "id">): Promise<Employe> {
  return withMockFallback(
    "personnel",
    async () =>
      versFront(await apiFetch<BackendEmployee>(`/employees/${id}`, { method: "PATCH", token, body: corps(data) })),
    async () => ({ ...data, id }),
  )
}

/** Rattacher ou détacher un profil client : routes distinctes, réservées au gérant. */
export function lierClient(token: string, id: string, clientId: string): Promise<void> {
  return withMockFallback(
    "personnel",
    () => apiFetch<void>(`/employees/${id}/link-client`, { method: "POST", token, body: { clientId } }),
    async () => undefined,
  )
}

export function delierClient(token: string, id: string): Promise<void> {
  return withMockFallback(
    "personnel",
    () => apiFetch<void>(`/employees/${id}/link-client`, { method: "DELETE", token }),
    async () => undefined,
  )
}
