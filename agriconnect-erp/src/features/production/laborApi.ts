import { apiFetch } from "@/lib/apiClient"
import { withMockFallback } from "@/lib/apiFallback"
import type { MainOeuvreEntry } from "@/types/production"
import { SEED_MAIN_OEUVRE } from "./mockProductionData"

/**
 * Adaptation main-d'œuvre. Un écart de modèle : le front saisit l'activité
 * comme un NOM libre (`activite`), le backend la référence par identifiant
 * (LaborLog.activityId -> LaborActivity, unique par ferme).
 *
 * La résolution se fait donc par nom. Si l'activité n'existe pas encore côté
 * serveur, elle est créée : c'est à cela que sert POST /labor/activities, et
 * c'est la seule façon de réconcilier une saisie libre avec une table de
 * référence. La route est réservée au gérant — pour un autre rôle, le 403
 * remonte à l'écran au lieu d'être avalé.
 */

interface BackendLaborActivity {
  id: string
  name: string
}

interface BackendLaborLog {
  id: string
  date: string
  workerCount: number
  note: string | null
  activityId: string
  activity?: BackendLaborActivity
}

// include: { activity: true } cote serveur : le nom arrive avec le releve.
function versEntry(log: BackendLaborLog): MainOeuvreEntry {
  return {
    id: log.id,
    date: log.date.slice(0, 10),
    activite: log.activity?.name ?? "",
    nbEmployes: log.workerCount,
    observation: log.note ?? "",
  }
}

export function fetchActivites(token: string): Promise<BackendLaborActivity[]> {
  return withMockFallback(
    "main-d'oeuvre",
    () => apiFetch<BackendLaborActivity[]>("/labor/activities", { token }),
    async () => [],
  )
}

export function fetchMainOeuvre(token: string): Promise<MainOeuvreEntry[]> {
  return withMockFallback(
    "main-d'oeuvre",
    async () => {
      return (await apiFetch<BackendLaborLog[]>("/labor/logs", { token })).map(versEntry)
    },
    async () => SEED_MAIN_OEUVRE,
  )
}

/** Identifiant de l'activité portant ce nom, créée si elle n'existe pas encore. */
async function resoudreActivite(token: string, nom: string): Promise<string> {
  const voulu = nom.trim()
  const activites = await apiFetch<BackendLaborActivity[]>("/labor/activities", { token })
  const connue = activites.find((a) => a.name.toLowerCase() === voulu.toLowerCase())
  if (connue) return connue.id

  const creee = await apiFetch<BackendLaborActivity>("/labor/activities", {
    method: "POST",
    token,
    body: { name: voulu },
  })
  return creee.id
}

export function createEntry(token: string, data: Omit<MainOeuvreEntry, "id">): Promise<MainOeuvreEntry> {
  return withMockFallback(
    "main-d'oeuvre",
    async () => {
      const activityId = await resoudreActivite(token, data.activite)
      const log = await apiFetch<BackendLaborLog>("/labor/logs", {
        method: "POST",
        token,
        body: {
          activityId,
          workerCount: data.nbEmployes,
          date: data.date || undefined,
          note: data.observation || undefined,
        },
      })
      return { ...versEntry(log), activite: data.activite }
    },
    async () => ({ ...data, id: crypto.randomUUID() }),
  )
}

export function updateEntry(token: string, id: string, data: Omit<MainOeuvreEntry, "id">): Promise<MainOeuvreEntry> {
  return withMockFallback(
    "main-d'oeuvre",
    async () => {
      const activityId = await resoudreActivite(token, data.activite)
      const log = await apiFetch<BackendLaborLog>(`/labor/logs/${id}`, {
        method: "PATCH",
        token,
        body: {
          activityId,
          workerCount: data.nbEmployes,
          date: data.date || undefined,
          note: data.observation || undefined,
        },
      })
      return { ...versEntry(log), activite: data.activite }
    },
    async () => ({ ...data, id }),
  )
}

export function deleteEntry(token: string, id: string): Promise<void> {
  return withMockFallback(
    "main-d'oeuvre",
    () => apiFetch<void>(`/labor/logs/${id}`, { method: "DELETE", token }),
    async () => undefined,
  )
}

export function createActivite(token: string, nom: string): Promise<BackendLaborActivity> {
  return withMockFallback(
    "main-d'oeuvre",
    () => apiFetch<BackendLaborActivity>("/labor/activities", { method: "POST", token, body: { name: nom } }),
    async () => ({ id: crypto.randomUUID(), name: nom }),
  )
}

export function updateActivite(token: string, id: string, nom: string): Promise<BackendLaborActivity> {
  return withMockFallback(
    "main-d'oeuvre",
    () => apiFetch<BackendLaborActivity>(`/labor/activities/${id}`, { method: "PATCH", token, body: { name: nom } }),
    async () => ({ id, name: nom }),
  )
}

/** Supprimer une activité échoue si des relevés la référencent (onDelete: Restrict). */
export function deleteActivite(token: string, id: string): Promise<void> {
  return withMockFallback(
    "main-d'oeuvre",
    () => apiFetch<void>(`/labor/activities/${id}`, { method: "DELETE", token }),
    async () => undefined,
  )
}
