import { apiFetch } from "@/lib/apiClient"
import { withMockFallback } from "@/lib/apiFallback"
import type { Client, ClientType } from "@/types/client"
import { SEED_CLIENTS } from "./mockClientsData"

/**
 * Adaptation clients. Les deux côtés ont une liste fermée de cinq types, mais
 * nommés différemment : correspondance un pour un ci-dessous.
 *
 * Séquelle : `fonction` et `departement` n'existent pas sur Client en base —
 * ils appartiennent à Employee. Un client de type « personnel » les perd donc
 * au rechargement, sauf si sa fiche employé est rattachée.
 */

type BackendClientType = "EXTERNE" | "INTERNE" | "PERSONNEL_UAZ" | "CAF" | "AGENT_STORE"

interface BackendClient {
  id: string
  name: string
  phone: string | null
  type: BackendClientType
  matriculeuaz: string | null
}

const TYPE_VERS_FRONT: Record<BackendClientType, ClientType> = {
  CAF: "cafeteria",
  AGENT_STORE: "store",
  INTERNE: "production",
  PERSONNEL_UAZ: "personnel",
  EXTERNE: "externe",
}

const TYPE_VERS_BACK: Record<ClientType, BackendClientType> = {
  cafeteria: "CAF",
  store: "AGENT_STORE",
  production: "INTERNE",
  personnel: "PERSONNEL_UAZ",
  externe: "EXTERNE",
}

function versFront(c: BackendClient): Client {
  return {
    id: c.id,
    nom: c.name,
    telephone: c.phone ?? undefined,
    type: TYPE_VERS_FRONT[c.type] ?? "externe",
    matriculeUaz: c.matriculeuaz ?? undefined,
  }
}

function corps(data: Omit<Client, "id">) {
  // `fonction` et `departement` ne sont pas envoyés : absents de
  // CreateClientDto, et forbidNonWhitelisted en ferait un 400.
  return {
    name: data.nom,
    phone: data.telephone || undefined,
    type: TYPE_VERS_BACK[data.type],
    matriculeuaz: data.matriculeUaz || undefined,
  }
}

export function fetchClients(token: string): Promise<Client[]> {
  return withMockFallback(
    "clients",
    async () => (await apiFetch<BackendClient[]>("/clients", { token })).map(versFront),
    async () => SEED_CLIENTS,
  )
}

export function createClient(token: string, data: Omit<Client, "id">): Promise<Client> {
  return withMockFallback(
    "clients",
    async (): Promise<Client> => {
      const cree = await apiFetch<BackendClient>("/clients", { method: "POST", token, body: corps(data) })
      // Les champs que le backend ignore sont reinjectes pour que l'ecran
      // affiche ce qui vient d'etre saisi, sans pretendre qu'ils sont persistes.
      return { ...versFront(cree), fonction: data.fonction, departement: data.departement }
    },
    async () => ({ ...data, id: crypto.randomUUID() }),
  )
}

export function updateClient(token: string, id: string, data: Omit<Client, "id">): Promise<Client> {
  return withMockFallback(
    "clients",
    async (): Promise<Client> => {
      const maj = await apiFetch<BackendClient>(`/clients/${id}`, { method: "PATCH", token, body: corps(data) })
      return { ...versFront(maj), fonction: data.fonction, departement: data.departement }
    },
    async () => ({ ...data, id }),
  )
}

export function deleteClient(token: string, id: string): Promise<void> {
  return withMockFallback(
    "clients",
    () => apiFetch<void>(`/clients/${id}`, { method: "DELETE", token }),
    async () => undefined,
  )
}
