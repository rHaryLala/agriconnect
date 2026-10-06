import { apiFetch } from "@/lib/apiClient"
import { withMockFallback } from "@/lib/apiFallback"
import { DEFAULT_STOCK_LOCATION, type StockArticle, type StockMovement } from "@/types/stock"
import { SEED_ARTICLES, SEED_MOVEMENTS } from "./mockStockData"

/**
 * Adaptation entre le contrat backend (anglais, calqué sur la base) et les
 * types front (français, cohérents avec clients, fournisseurs, personnel…).
 *
 * On adapte au lieu de renommer : le front nomme ses champs en français partout,
 * et aligner le seul StockArticle sur la base ferait cohabiter `article.name`
 * avec `client.nom`. L'adaptation coûte ce fichier ; le renommage coûterait la
 * cohérence de 75 fichiers pour aucun gain à l'exécution.
 */

interface BackendStockItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  miniAlert: number
  locationId: string | null
}

interface BackendMovement {
  id: string
  itemId: string
  type: "IN" | "OUT" | "AJUSTEMENT" | "TRANSFERT"
  quantity: number
  repeseeQuantity: number | null
  reason: string | null
  date: string
  user?: { firstName: string; lastName: string }
}

const TYPE_VERS_FRONT = { IN: "entree", OUT: "sortie", TRANSFERT: "transfert", AJUSTEMENT: "entree" } as const
const TYPE_VERS_BACK = { entree: "IN", sortie: "OUT", transfert: "TRANSFERT" } as const

function versMouvementFront(m: BackendMovement): StockMovement {
  return {
    id: m.id,
    articleId: m.itemId,
    type: TYPE_VERS_FRONT[m.type],
    // L'emplacement reste la valeur par défaut : le backend le porte en UUID sur
    // l'article, et aucune route n'expose la liste des StockLocation.
    emplacement: DEFAULT_STOCK_LOCATION,
    // Côté backend, `quantity` est la quantité annoncée et `repeseeQuantity` la
    // quantité repesée. Côté front, `quantite` est la quantité réelle.
    quantite: m.repeseeQuantity ?? m.quantity,
    quantiteAnnoncee: m.repeseeQuantity !== null ? m.quantity : undefined,
    date: m.date.slice(0, 10),
    responsable: m.user ? `${m.user.firstName} ${m.user.lastName}`.trim() : undefined,
    observation: m.reason ?? "",
  }
}

/**
 * `quantiteInitiale` est dérivée, pas lue : le backend ne connaît pas de stock
 * d'ouverture, il maintient `quantity` comme stock courant. On pose
 * `quantiteInitiale = quantity - somme(mouvements)` pour que la formule du front
 * (computeCurrentStock) retombe exactement sur le `quantity` du serveur, sans
 * toucher à un seul calcul ni à un seul affichage existant.
 */
function versArticleFront(item: BackendStockItem, mouvements: StockMovement[]): StockArticle {
  const delta = mouvements
    .filter((m) => m.articleId === item.id)
    .reduce((total, m) => total + (m.type === "sortie" ? -m.quantite : m.quantite), 0)

  return {
    id: item.id,
    nom: item.name,
    unite: item.unit,
    quantiteInitiale: item.quantity - delta,
    seuilCritique: item.miniAlert,
  }
}

export function fetchStock(token: string): Promise<{ articles: StockArticle[]; movements: StockMovement[] }> {
  return withMockFallback(
    "stock",
    async () => {
      const [items, historique] = await Promise.all([
        apiFetch<BackendStockItem[]>("/stock/items", { token }),
        apiFetch<BackendMovement[]>("/stock/historique", { token }),
      ])
      const movements = historique.map(versMouvementFront)
      return { articles: items.map((item) => versArticleFront(item, movements)), movements }
    },
    async () => ({ articles: SEED_ARTICLES, movements: SEED_MOVEMENTS }),
  )
}

export function createArticle(token: string, data: Omit<StockArticle, "id">): Promise<StockArticle> {
  return withMockFallback(
    "stock",
    async () => {
      const item = await apiFetch<BackendStockItem>("/stock/items", {
        method: "POST",
        token,
        // `category` n'est pas envoyée : le backend lui applique un défaut. Le
        // front n'a pas cette notion, inventer une valeur ici la mettrait en base.
        body: { name: data.nom, unit: data.unite, quantity: data.quantiteInitiale, miniAlert: data.seuilCritique },
      })
      return versArticleFront(item, [])
    },
    async () => ({ ...data, id: crypto.randomUUID() }),
  )
}

export function createMovement(token: string, data: Omit<StockMovement, "id">): Promise<StockMovement> {
  return withMockFallback(
    "stock",
    async () => {
      const aRepesage = data.quantiteAnnoncee !== undefined
      const m = await apiFetch<BackendMovement>(`/stock/items/${data.articleId}/movements`, {
        method: "POST",
        token,
        body: {
          type: TYPE_VERS_BACK[data.type],
          quantity: aRepesage ? data.quantiteAnnoncee : data.quantite,
          repeseeQuantity: aRepesage ? data.quantite : undefined,
          reason: data.observation || undefined,
        },
      })
      return versMouvementFront(m)
    },
    async () => ({ ...data, id: crypto.randomUUID() }),
  )
}

/** RG-06 : un mouvement se corrige par une écriture inverse, jamais par une suppression. */
export function correctMovement(token: string, movementId: string, reason: string): Promise<void> {
  return withMockFallback(
    "stock",
    () => apiFetch<void>(`/stock/movements/${movementId}/correction`, { method: "POST", token, body: { reason } }),
    async () => undefined,
  )
}
