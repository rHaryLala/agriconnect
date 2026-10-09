import { apiFetch } from "@/lib/apiClient"
import { withMockFallback } from "@/lib/apiFallback"
import type { FinanceTransaction, TransactionType } from "@/types/finance"
import { SEED_TRANSACTIONS } from "./mockFinanceData"

/**
 * Module /transactions, distinct de /finance. Il écrit dans la même table mais
 * expose en plus le rattachement à un client ou à une facture, et un cumul
 * recettes/dépenses.
 *
 * Deux réserves, volontairement non contournées :
 * - `GET /transactions` attend un `farmId` en query et, s'il manque, renvoie
 *   les transactions de TOUTES les fermes. Le front n'a pas de farmId (il vit
 *   dans le jeton côté serveur), donc la liste passe par /finance. Ici, seules
 *   les routes qui ciblent un identifiant précis sont exposées.
 * - PATCH et DELETE existent, mais supprimer une écriture casse la piste
 *   d'audit que /finance garantit par l'écriture inverse. Ils sont fournis
 *   sans être branchés sur les écrans.
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
}

export interface CashFlow {
  recettes: number
  depenses: number
  balance: number
}

const TYPE_VERS_FRONT: Record<BackendTransaction["type"], TransactionType> = {
  RECETTE: "recette",
  DEPENSE: "depense",
}

/** Le rattachement client/facture, que FinanceTransaction ne porte pas. */
export interface RattachementTransaction {
  clientId?: string
  invoiceId?: string
  reference?: string
}

function versFront(t: BackendTransaction): FinanceTransaction & RattachementTransaction {
  return {
    id: t.id,
    type: TYPE_VERS_FRONT[t.type],
    // Même séquelle que financeApi : aucun DTO n'accepte categoryId.
    categorie: "",
    montant: Number(t.amount),
    date: t.date.slice(0, 10),
    description: t.notes ?? "",
    clientId: t.clientId ?? undefined,
    invoiceId: t.invoiceId ?? undefined,
    reference: t.reference ?? undefined,
  }
}

export function createTransaction(
  token: string,
  data: Omit<FinanceTransaction, "id"> & RattachementTransaction,
): Promise<FinanceTransaction & RattachementTransaction> {
  return withMockFallback(
    "transactions",
    async () =>
      versFront(
        await apiFetch<BackendTransaction>("/transactions", {
          method: "POST",
          token,
          body: {
            amount: data.montant,
            type: data.type === "recette" ? "RECETTE" : "DEPENSE",
            notes: data.description || undefined,
            reference: data.reference || undefined,
            date: data.date || undefined,
            clientId: data.clientId || undefined,
            invoiceId: data.invoiceId || undefined,
          },
        }),
      ),
    async () => ({ ...data, id: crypto.randomUUID() }),
  )
}

export function fetchTransaction(token: string, id: string): Promise<FinanceTransaction & RattachementTransaction> {
  return withMockFallback(
    "transactions",
    async () => versFront(await apiFetch<BackendTransaction>(`/transactions/${id}`, { token })),
    async () => {
      const locale = SEED_TRANSACTIONS.find((t) => t.id === id) ?? SEED_TRANSACTIONS[0]
      return { ...locale }
    },
  )
}

/** Cumul recettes/dépenses. `farmId` est obligatoire côté serveur sur cette route. */
export function fetchCashFlow(token: string, farmId: string): Promise<CashFlow> {
  return withMockFallback(
    "transactions",
    () => apiFetch<CashFlow>(`/transactions/cash-flow?farmId=${encodeURIComponent(farmId)}`, { token }),
    async () => {
      const recettes = SEED_TRANSACTIONS.filter((t) => t.type === "recette").reduce((s, t) => s + t.montant, 0)
      const depenses = SEED_TRANSACTIONS.filter((t) => t.type === "depense").reduce((s, t) => s + t.montant, 0)
      return { recettes, depenses, balance: recettes - depenses }
    },
  )
}

export function updateTransaction(
  token: string,
  id: string,
  data: Partial<Omit<FinanceTransaction, "id">> & RattachementTransaction,
): Promise<FinanceTransaction & RattachementTransaction> {
  return withMockFallback(
    "transactions",
    async () =>
      versFront(
        await apiFetch<BackendTransaction>(`/transactions/${id}`, {
          method: "PATCH",
          token,
          body: {
            amount: data.montant,
            type: data.type ? (data.type === "recette" ? "RECETTE" : "DEPENSE") : undefined,
            notes: data.description || undefined,
            reference: data.reference || undefined,
            date: data.date || undefined,
            clientId: data.clientId || undefined,
            invoiceId: data.invoiceId || undefined,
          },
        }),
      ),
    async () => {
      const locale = SEED_TRANSACTIONS.find((t) => t.id === id) ?? SEED_TRANSACTIONS[0]
      return { ...locale, ...data, id }
    },
  )
}

/**
 * Suppression sèche. Préférer correctTransaction de financeApi : elle laisse
 * une trace, celle-ci non.
 */
export function deleteTransaction(token: string, id: string): Promise<void> {
  return withMockFallback(
    "transactions",
    () => apiFetch<void>(`/transactions/${id}`, { method: "DELETE", token }),
    async () => undefined,
  )
}
