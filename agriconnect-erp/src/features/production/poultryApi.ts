import { apiFetch } from "@/lib/apiClient"
import { withMockFallback } from "@/lib/apiFallback"
import type { KuroilerPoule, KuroilerPouleStatut, KuroilerPouleSuivi } from "@/types/production"
import { SEED_KUROILER_POULES, SEED_KUROILER_SUIVIS } from "./mockProductionData"

/**
 * Adaptation du suivi individuel des volailles.
 *
 * Un seul modèle backend (PoultryTracking) sert les trois filières, discriminées
 * par `type`. Ce fichier ne traite que les pondeuses Kuroiler ; poulards et œufs
 * restent locaux, leurs écrans étant des journaux de vente qui dépendent de la
 * facturation.
 */

const TYPE_KUROILER = "KUROILER"

interface BackendPoultry {
  id: string
  tagOrNumber: string | null
  type: string
  status: "EN_ELEVAGE" | "EN_COUVEUSE" | "VENDU" | "DECEDE"
  initialAge: number
  ageActuelEnSemaines?: number
  entryDate: string
  exitDate: string | null
  exitReason: string | null
  notes: string | null
  weeklyRecords?: BackendWeeklyRecord[]
}

interface BackendWeeklyRecord {
  id: string
  poultryTrackingId: string
  weekNumber: number
  recordDate: string
  weightKg: number | null
  ponteRate: number | null
  vaccineName: string | null
  notes: string | null
}

const STATUT: Record<string, KuroilerPouleStatut> = {
  EN_ELEVAGE: "active",
  EN_COUVEUSE: "active",
  VENDU: "vendue",
  DECEDE: "morte",
}

/** « perdue » n'a pas de valeur dédiée côté backend : DECEDE est le plus proche. */
const STATUT_VERS_BACK: Record<Exclude<KuroilerPouleStatut, "active">, string> = {
  vendue: "VENDU",
  morte: "DECEDE",
  perdue: "DECEDE",
}

function versFront(p: BackendPoultry): KuroilerPoule {
  // L'âge est renvoyé en semaines et recalculé par le serveur ; le front
  // l'affiche en mois.
  const semaines = p.ageActuelEnSemaines ?? p.initialAge
  return {
    id: p.id,
    bracelet: p.tagOrNumber ?? "",
    dateEntree: p.entryDate.slice(0, 10),
    ageMois: Math.round(semaines / 4.345),
    // La ponte n'est pas un état de l'animal côté backend mais un taux relevé
    // chaque semaine : on la déduit du dernier relevé non nul.
    ponte: (p.weeklyRecords ?? []).some((r) => (r.ponteRate ?? 0) > 0),
    statut: STATUT[p.status] ?? "active",
    dateSortie: p.exitDate ? p.exitDate.slice(0, 10) : undefined,
    observation: p.notes ?? p.exitReason ?? "",
  }
}

function versSuiviFront(r: BackendWeeklyRecord): KuroilerPouleSuivi {
  return {
    id: r.id,
    pouleId: r.poultryTrackingId,
    date: r.recordDate.slice(0, 10),
    poidsKg: r.weightKg ?? 0,
    vaccin: r.vaccineName ?? "",
    observation: r.notes ?? "",
  }
}

export function fetchKuroilerPoules(
  token: string,
): Promise<{ poules: KuroilerPoule[]; suivis: KuroilerPouleSuivi[] }> {
  return withMockFallback(
    "poultry",
    async () => {
      const liste = await apiFetch<BackendPoultry[]>(`/poultry?type=${TYPE_KUROILER}`, { token })
      // GET /poultry ne joint pas les relevés : il faut une requête par animal.
      // Acceptable sur un cheptel de pondeuses nominatives ; à remplacer par un
      // include côté backend si l'effectif grossit.
      const details = await Promise.all(liste.map((p) => apiFetch<BackendPoultry>(`/poultry/${p.id}`, { token })))
      return {
        poules: details.map(versFront),
        suivis: details.flatMap((p) => (p.weeklyRecords ?? []).map(versSuiviFront)),
      }
    },
    async () => ({ poules: SEED_KUROILER_POULES, suivis: SEED_KUROILER_SUIVIS }),
  )
}

export function createKuroilerPoule(
  token: string,
  data: Omit<KuroilerPoule, "id" | "statut">,
): Promise<KuroilerPoule> {
  return withMockFallback(
    "poultry",
    async () =>
      versFront(
        await apiFetch<BackendPoultry>("/poultry", {
          method: "POST",
          token,
          body: {
            tagOrNumber: data.bracelet || undefined,
            type: TYPE_KUROILER,
            initialAge: Math.round(data.ageMois * 4.345),
            notes: data.observation || undefined,
          },
        }),
      ),
    async () => ({ ...data, id: crypto.randomUUID(), statut: "active" }),
  )
}

export function recordSortiePoule(
  token: string,
  id: string,
  data: { statut: Exclude<KuroilerPouleStatut, "active">; observation: string },
): Promise<void> {
  return withMockFallback(
    "poultry",
    async () => {
      // La vente est une route distincte : elle génère la recette en caisse.
      // Faute de prix et de client sur cet écran, on enregistre une sortie.
      await apiFetch<unknown>(`/poultry/${id}/exit`, {
        method: "POST",
        token,
        body: { status: STATUT_VERS_BACK[data.statut], exitReason: data.observation },
      })
    },
    async () => undefined,
  )
}

export function createSuiviPoule(token: string, data: Omit<KuroilerPouleSuivi, "id">): Promise<KuroilerPouleSuivi> {
  return withMockFallback(
    "poultry",
    async () =>
      versSuiviFront(
        await apiFetch<BackendWeeklyRecord>(`/poultry/${data.pouleId}/weekly-records`, {
          method: "POST",
          token,
          body: {
            // weekNumber est obligatoire et le front ne le saisit pas : on le
            // dérive de la date du relevé.
            weekNumber: Math.max(1, Math.ceil(new Date(data.date).getDate() / 7)),
            weightKg: data.poidsKg || undefined,
            vaccineName: data.vaccin || undefined,
            notes: data.observation || undefined,
          },
        }),
      ),
    async () => ({ ...data, id: crypto.randomUUID() }),
  )
}
