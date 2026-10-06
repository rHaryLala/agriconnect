import { apiFetch } from "@/lib/apiClient"
import { withMockFallback } from "@/lib/apiFallback"
import type { BovinAnimal, BovinEtat, BovinProductivite, BovinSortieType } from "@/types/production"
import { SEED_BOVINS } from "./mockProductionData"

/**
 * Adaptation bovins. Correspondance champ pour champ : le modèle Cattle porte
 * déjà breed, productivite, reproduction, signature, clientId et deathReason,
 * tous migrés. Seuls les noms et quelques valeurs d'enum diffèrent.
 */

interface BackendCattle {
  id: string
  nameOrTag: string
  breed: string | null
  gender: string
  category: string | null
  status: "EN_ELEVAGE" | "VENDU" | "DECEDE"
  productivite: "PRODUCTIVE" | "TARIE" | null
  reproduction: "GESTANTE" | "NON_GESTANTE" | "ALLAITANTE" | "NON_ALLAITANTE" | null
  entryType: "NAISSANCE" | "ACHAT"
  entryDate: string
  birthDate: string | null
  saleDate: string | null
  salePrice: string | number | null
  signature: string | null
  clientId: string | null
  deathDate: string | null
  deathReason: string | null
  notes: string | null
}

const STATUT = { EN_ELEVAGE: "present", VENDU: "vendu", DECEDE: "mort" } as const
const PRODUCTIVITE: Record<string, BovinProductivite> = { PRODUCTIVE: "productive", TARIE: "taris" }
const ETAT: Record<string, BovinEtat> = {
  GESTANTE: "gestante",
  NON_GESTANTE: "non_gestant",
  ALLAITANTE: "mampinono",
  NON_ALLAITANTE: "tsy_mampinono",
}
const ETAT_VERS_BACK = Object.fromEntries(Object.entries(ETAT).map(([k, v]) => [v, k]))
const PRODUCTIVITE_VERS_BACK = Object.fromEntries(Object.entries(PRODUCTIVITE).map(([k, v]) => [v, k]))

function jour(iso: string | null): string | undefined {
  return iso ? iso.slice(0, 10) : undefined
}

function versFront(c: BackendCattle): BovinAnimal {
  // Le front distingue vente et décès par typeSortie ; le backend par status et
  // par la date renseignée. On déduit l'un de l'autre.
  const typeSortie: BovinSortieType | undefined =
    c.status === "VENDU" ? "vente" : c.status === "DECEDE" ? "deces" : undefined

  return {
    id: c.id,
    identifiant: c.nameOrTag,
    genre: c.gender.toLowerCase().startsWith("m") ? "male" : "femelle",
    race: c.breed ?? "",
    type: c.category ?? "",
    productivite: c.productivite ? PRODUCTIVITE[c.productivite] : undefined,
    etat: c.reproduction ? ETAT[c.reproduction] : undefined,
    dateEntree: jour(c.entryDate) ?? "",
    typeEntree: c.entryType === "ACHAT" ? "achat" : "naissance",
    statut: STATUT[c.status],
    dateSortie: jour(c.saleDate) ?? jour(c.deathDate),
    typeSortie,
    clientId: c.clientId ?? undefined,
    // salePrice est un Decimal Prisma : sérialisé en chaîne, jamais en nombre.
    prixVente: c.salePrice !== null ? Number(c.salePrice) : undefined,
    signataire: c.signature ?? undefined,
    observation: c.notes ?? c.deathReason ?? "",
  }
}

export function fetchBovins(token: string): Promise<BovinAnimal[]> {
  return withMockFallback(
    "bovins",
    async () => (await apiFetch<BackendCattle[]>("/cattle", { token })).map(versFront),
    async () => SEED_BOVINS,
  )
}

export function createBovin(token: string, data: Omit<BovinAnimal, "id" | "statut">): Promise<BovinAnimal> {
  return withMockFallback(
    "bovins",
    async () =>
      versFront(
        await apiFetch<BackendCattle>("/cattle", {
          method: "POST",
          token,
          body: {
            nameOrTag: data.identifiant,
            gender: data.genre,
            category: data.type || undefined,
            entryType: data.typeEntree === "achat" ? "ACHAT" : "NAISSANCE",
            notes: data.observation || undefined,
          },
        }),
      ),
    async () => ({ ...data, id: crypto.randomUUID(), statut: "present" }),
  )
}

/**
 * Une vente passe par POST /cattle/:id/sell, qui crée en plus la recette en
 * caisse ; un décès par POST /cattle/:id/death. Deux routes distinctes côté
 * backend parce que les conséquences comptables ne sont pas les mêmes.
 */
export function recordSortieBovin(
  token: string,
  id: string,
  data: { typeSortie: BovinSortieType; clientId?: string; prixVente?: number; signataire: string; observation: string },
): Promise<void> {
  return withMockFallback(
    "bovins",
    async () => {
      if (data.typeSortie === "vente") {
        // SellCattleDto exige clientId (UUID) et salePrice > 0. Sans client, le
        // serveur repond 400 : on laisse l'erreur remonter plutot que de
        // fabriquer un identifiant.
        await apiFetch<unknown>(`/cattle/${id}/sell`, {
          method: "POST",
          token,
          body: { clientId: data.clientId, salePrice: data.prixVente, signature: data.signataire || undefined },
        })
      } else {
        // RecordDeathDto attend deathReason, avec au moins 5 caracteres.
        await apiFetch<unknown>(`/cattle/${id}/death`, {
          method: "POST",
          token,
          body: { deathReason: data.observation },
        })
      }
    },
    async () => undefined,
  )
}

export function updateBovin(
  token: string,
  id: string,
  data: { productivite?: BovinProductivite; etat?: BovinEtat; race?: string; type?: string },
): Promise<void> {
  return withMockFallback(
    "bovins",
    () =>
      apiFetch<void>(`/cattle/${id}`, {
        method: "PATCH",
        token,
        body: {
          breed: data.race || undefined,
          category: data.type || undefined,
          productivite: data.productivite ? PRODUCTIVITE_VERS_BACK[data.productivite] : undefined,
          reproduction: data.etat ? ETAT_VERS_BACK[data.etat] : undefined,
        },
      }),
    async () => undefined,
  )
}
