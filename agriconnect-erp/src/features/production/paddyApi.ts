import { apiFetch } from "@/lib/apiClient"
import { withMockFallback } from "@/lib/apiFallback"
import type { RizDecorticage, RizRecolte, RizSechageEvent, RizSechageType } from "@/types/production"
import { SEED_RIZ_DECORTICAGE, SEED_RIZ_RECOLTES, SEED_RIZ_SECHAGE } from "./mockProductionData"

/**
 * Adaptation riz. Écart de structure, pas seulement de nommage : le backend est
 * organisé par LOT (PaddyProcess, avec ses vagues de séchage et ses
 * décorticages), alors que les écrans du front présentent trois listes à plat
 * sans notion de lot.
 *
 * Conséquences, documentées plutôt que masquées :
 * - une récolte du front = un lot du backend, un pour un ;
 * - `lotNumber` est obligatoire côté serveur et unique par ferme, mais le front
 *   ne le saisit pas : il est dérivé de la date de récolte ;
 * - un séchage et un décorticage s'attachent obligatoirement à un lot. Faute de
 *   sélecteur à l'écran, ils vont sur le lot EN COURS le plus récent. S'il n'y
 *   en a aucun, l'appel échoue au lieu d'ouvrir un lot au hasard.
 *
 * Les ventes de riz (RizVente) ne sont pas ici : /paddy n'a aucune route de
 * vente, elles passent par le stock et la facturation.
 */

interface BackendDryingWave {
  id: string
  waveNumber: number
  type: "PASSAGE" | "FINALISATION"
  date: string
  quantityOutKg: number | null
  quantityReturnedKg: number | null
  bags: number | null
  dryPaddyKg: number | null
  note: string | null
}

interface BackendMilling {
  id: string
  date: string
  paddyUsedKg: number
  riceOutputKg: number
  note: string | null
}

interface BackendPaddyProcess {
  id: string
  lotNumber: string
  paddyInputKg: number
  paddyInputLot: number
  waveNumber: number
  status: "IN_PROGRESS" | "COMPLETED"
  harvestDate: string
  transport: string | null
  driverName: string | null
  storekeeperName: string | null
  note: string | null
  dryingWaves: BackendDryingWave[]
  millings: BackendMilling[]
}

const SECHAGE_VERS_FRONT: Record<BackendDryingWave["type"], RizSechageType> = {
  PASSAGE: "passage",
  FINALISATION: "finalisation",
}

function jour(iso: string): string {
  return iso.slice(0, 10)
}

function versRecolte(lot: BackendPaddyProcess): RizRecolte {
  return {
    id: lot.id,
    date: jour(lot.harvestDate),
    sacs: lot.paddyInputLot,
    quantiteKg: lot.paddyInputKg,
    transport: lot.transport ?? "",
    conducteur: lot.driverName ?? "",
    magasinier: lot.storekeeperName ?? "",
    observation: lot.note ?? "",
  }
}

function versSechage(v: BackendDryingWave): RizSechageEvent {
  return {
    id: v.id,
    date: jour(v.date),
    type: SECHAGE_VERS_FRONT[v.type],
    quantiteSortie: v.quantityOutKg ?? undefined,
    quantiteRetournee: v.quantityReturnedKg ?? undefined,
    sacs: v.bags ?? undefined,
    quantiteKg: v.dryPaddyKg ?? undefined,
    observation: v.note ?? "",
  }
}

function versDecorticage(m: BackendMilling): RizDecorticage {
  return {
    id: m.id,
    date: jour(m.date),
    quantitePaddyKg: m.paddyUsedKg,
    quantiteRizKg: m.riceOutputKg,
    observation: m.note ?? "",
  }
}

/** Un numéro de lot stable et lisible, à défaut d'un champ saisi à l'écran. */
function numeroDeLot(date: string): string {
  return `PADDY-${date}-${Date.now().toString(36).toUpperCase()}`
}

export function fetchRiz(token: string): Promise<{
  recoltes: RizRecolte[]
  sechageEvents: RizSechageEvent[]
  decorticages: RizDecorticage[]
}> {
  return withMockFallback(
    "paddy",
    async () => {
      // GET /paddy embarque deja les vagues et les decorticages de chaque lot :
      // un seul appel, puis mise a plat pour les trois listes du front.
      const lots = await apiFetch<BackendPaddyProcess[]>("/paddy", { token })
      return {
        recoltes: lots.map(versRecolte),
        sechageEvents: lots.flatMap((l) => l.dryingWaves.map(versSechage)),
        decorticages: lots.flatMap((l) => l.millings.map(versDecorticage)),
      }
    },
    async () => ({
      recoltes: SEED_RIZ_RECOLTES,
      sechageEvents: SEED_RIZ_SECHAGE,
      decorticages: SEED_RIZ_DECORTICAGE,
    }),
  )
}

export function createRecolte(token: string, data: Omit<RizRecolte, "id">): Promise<RizRecolte> {
  return withMockFallback(
    "paddy",
    async () =>
      versRecolte(
        await apiFetch<BackendPaddyProcess>("/paddy", {
          method: "POST",
          token,
          body: {
            lotNumber: numeroDeLot(data.date),
            paddyInputKg: data.quantiteKg,
            paddyInputLot: data.sacs,
            harvestDate: data.date || undefined,
            transport: data.transport || undefined,
            driverName: data.conducteur || undefined,
            storekeeperName: data.magasinier || undefined,
            note: data.observation || undefined,
          },
        }),
      ),
    async () => ({ ...data, id: crypto.randomUUID() }),
  )
}

/** Identifiant du lot en cours le plus récent, ou null si la ferme n'en a aucun. */
export async function lotEnCours(token: string): Promise<string | null> {
  const lots = await apiFetch<BackendPaddyProcess[]>("/paddy?status=IN_PROGRESS", { token })
  return lots[0]?.id ?? null
}

export function createSechageEvent(
  token: string,
  processId: string,
  data: Omit<RizSechageEvent, "id">,
): Promise<RizSechageEvent> {
  return withMockFallback(
    "paddy",
    async () =>
      versSechage(
        await apiFetch<BackendDryingWave>(`/paddy/${processId}/drying-waves`, {
          method: "POST",
          token,
          body: {
            type: data.type === "finalisation" ? "FINALISATION" : "PASSAGE",
            date: data.date || undefined,
            quantityOutKg: data.quantiteSortie,
            quantityReturnedKg: data.quantiteRetournee,
            bags: data.sacs,
            dryPaddyKg: data.quantiteKg,
            note: data.observation || undefined,
          },
        }),
      ),
    async () => ({ ...data, id: crypto.randomUUID() }),
  )
}

export function createDecorticage(
  token: string,
  processId: string,
  data: Omit<RizDecorticage, "id">,
  riceStockItemId?: string,
): Promise<RizDecorticage> {
  return withMockFallback(
    "paddy",
    async () =>
      versDecorticage(
        await apiFetch<BackendMilling>(`/paddy/${processId}/millings`, {
          method: "POST",
          token,
          body: {
            paddyUsedKg: data.quantitePaddyKg,
            riceOutputKg: data.quantiteRizKg,
            date: data.date || undefined,
            // Renseigne, le serveur cree en plus l'entree en stock du riz.
            riceStockItemId,
            note: data.observation || undefined,
          },
        }),
      ),
    async () => ({ ...data, id: crypto.randomUUID() }),
  )
}

/** Clôture un lot : le reliquat éventuel est acté comme une perte. Gérant seul. */
export function closeLot(token: string, processId: string): Promise<void> {
  return withMockFallback(
    "paddy",
    () => apiFetch<void>(`/paddy/${processId}/complete`, { method: "PATCH", token }),
    async () => undefined,
  )
}
