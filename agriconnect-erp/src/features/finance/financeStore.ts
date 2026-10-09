import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { FinanceTransaction } from "@/types/finance"
import { SEED_TRANSACTIONS } from "./mockFinanceData"
import { newId } from "@/lib/id"
import { useAuthStore } from "@/features/auth/authStore"
import { createTransaction, fetchTransactions } from "./financeApi"

const FAKE_LATENCY_MS = 500

interface FinanceState {
  transactions: FinanceTransaction[]
  isLoading: boolean
  hasFetched: boolean
  soldeOuverture: number
  fetchAll: () => Promise<void>
  addTransaction: (data: Omit<FinanceTransaction, "id">) => Promise<void>
  updateTransaction: (id: string, data: Omit<FinanceTransaction, "id">) => Promise<void>
  deleteTransaction: (id: string) => void
  setSoldeOuverture: (value: number) => void
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      isLoading: false,
      hasFetched: false,
      soldeOuverture: 0,
      fetchAll: async () => {
        if (get().hasFetched) return
        set({ isLoading: true })
        try {
          const token = useAuthStore.getState().token
          const transactions = token ? await fetchTransactions(token) : SEED_TRANSACTIONS
          set({ transactions, hasFetched: true })
        } finally {
          set({ isLoading: false })
        }
      },

      addTransaction: async (data) => {
        const token = useAuthStore.getState().token
        const transaction = token ? await createTransaction(token, data) : { ...data, id: newId("t") }
        set({ transactions: [transaction, ...get().transactions] })
      },

      // Modification et suppression restent locales : /finance n'expose ni PATCH
      // ni DELETE, et c'est delibere — une ecriture se corrige par une ecriture
      // inverse (correctTransaction), qui exige un motif que l'ecran ne demande
      // pas encore.
      updateTransaction: (id, data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({ transactions: get().transactions.map((t) => (t.id === id ? { ...data, id } : t)) })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      deleteTransaction: (id) => set({ transactions: get().transactions.filter((t) => t.id !== id) }),

      setSoldeOuverture: (value) => set({ soldeOuverture: value }),
    }),
    {
      name: "agriconnect-finance",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        hasFetched: state.hasFetched,
        soldeOuverture: state.soldeOuverture,
      }),
    }
  )
)