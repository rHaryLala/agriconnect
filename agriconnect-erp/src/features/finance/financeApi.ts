import { apiFetch } from "@/lib/apiClient"
import { withMockFallback } from "@/lib/apiFallback"
import type { FinanceTransaction, TransactionType } from "@/types/finance"
import { SEED_TRANSACTIONS } from "./mockFinanceData"

/**
 * Adaptation finance. On passe par /finance plutôt que par /transactions :
 * /finance déduit la ferme du jeton, applique les rôles par route, et interdit
 * la suppression d'une écriture (une transaction se corrige par une écriture
 * inverse, jamais par un DELETE).
 *
 * Séquelle : `categorie` ne circule pas. La colonne existe en base
 * (Transaction.categoryId -> TransactionCategory) et la baseline la crée, mais
 * aucun DTO ne l'accepte et aucune route n'expose les catégories. Elle reste
 * donc locale, portée par categoriesStore. Demande à faire côté backend, pas
 * côté DBA : le schéma est prêt.
 */

interface BackendTransaction {
  id: string
  amount: string | number
  type: "RECETTE" | "DEPENSE"
  reference: string | null
  notes: string | null
  date: string
  clientId: string | null
  invoiceId: string | null
  categoryId: string | null
}

/** Une ligne du journal de caisse : la transaction plus le solde cumulé. */
export interface LigneJournalCaisse extends FinanceTransaction {
  soldeApres: number
}

export interface Benefice {
  totalRecettes: number
  totalDepenses: number
  benefice: number
}

const TYPE_VERS_FRONT: Record<BackendTransaction["type"], TransactionType> = {
  RECETTE: "recette",
  DEPENSE: "depense",
}

function versFront(t: BackendTransaction): FinanceTransaction {
  return {
    id: t.id,
    type: TYPE_VERS_FRONT[t.type],
    // Pas de catégorie dans le contrat actuel : on laisse vide plutôt que de
    // détourner `reference`, qui est le numéro de reçu papier.
    categorie: "",
    // amount est un Decimal : sérialisé en chaîne.
    montant: Number(t.amount),
    date: t.date.slice(0, 10),
    description: t.notes ?? "",
  }
}

function corps(data: Omit<FinanceTransaction, "id">) {
  // `categorie` n'est pas envoyée : aucun DTO ne l'accepte, et
  // forbidNonWhitelisted transformerait l'appel en 400.
  return {
    amount: data.montant,
    type: data.type === "recette" ? "RECETTE" : "DEPENSE",
    notes: data.description || undefined,
    date: data.date || undefined,
  }
}

export function fetchTransactions(token: string): Promise<FinanceTransaction[]> {
  return withMockFallback(
    "finance",
    async () => (await apiFetch<BackendTransaction[]>("/finance/transactions", { token })).map(versFront),
    async () => SEED_TRANSACTIONS,
  )
}

export function createTransaction(token: string, data: Omit<FinanceTransaction, "id">): Promise<FinanceTransaction> {
  return withMockFallback(
    "finance",
    async (): Promise<FinanceTransaction> => {
      const creee = await apiFetch<BackendTransaction>("/finance/transactions", {
        method: "POST",
        token,
        body: corps(data),
      })
      // La catégorie saisie est réinjectée pour l'affichage : le serveur ne la
      // connaît pas, elle vit dans categoriesStore.
      return { ...versFront(creee), categorie: data.categorie }
    },
    async () => ({ ...data, id: crypto.randomUUID() }),
  )
}

/** Journal de caisse : solde cumulé calculé par le serveur, écriture par écriture. */
export function fetchJournalCaisse(token: string): Promise<LigneJournalCaisse[]> {
  return withMockFallback(
    "finance",
    async () => {
      const lignes = await apiFetch<(BackendTransaction & { soldeApres: number })[]>("/finance/journal-caisse", {
        token,
      })
      return lignes.map((l) => ({ ...versFront(l), soldeApres: l.soldeApres }))
    },
    async () => {
      let solde = 0
      return [...SEED_TRANSACTIONS]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((t) => {
          solde += t.type === "recette" ? t.montant : -t.montant
          return { ...t, soldeApres: solde }
        })
    },
  )
}

export function fetchBenefice(token: string): Promise<Benefice> {
  return withMockFallback(
    "finance",
    () => apiFetch<Benefice>("/finance/benefice", { token }),
    async () => {
      const totalRecettes = SEED_TRANSACTIONS.filter((t) => t.type === "recette").reduce((s, t) => s + t.montant, 0)
      const totalDepenses = SEED_TRANSACTIONS.filter((t) => t.type === "depense").reduce((s, t) => s + t.montant, 0)
      return { totalRecettes, totalDepenses, benefice: totalRecettes - totalDepenses }
    },
  )
}

/**
 * Annule une écriture par une écriture inverse. Le motif fait au moins dix
 * caractères côté serveur : c'est ce qui rend la correction auditable.
 */
export function correctTransaction(token: string, originalTransactionId: string, reason: string): Promise<void> {
  return withMockFallback(
    "finance",
    () =>
      apiFetch<void>("/finance/transactions/correction", {
        method: "POST",
        token,
        body: { originalTransactionId, reason },
      }),
    async () => undefined,
  )
}
