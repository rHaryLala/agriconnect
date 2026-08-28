import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { FinanceTransaction } from "@/types/finance"
import { SEED_TRANSACTIONS } from "./mockFinanceData"

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
      fetchAll: () => {
        if (get().hasFetched) return Promise.resolve()
        return new Promise((resolve) => {
          set({ isLoading: true })
          setTimeout(() => {
            set({ transactions: SEED_TRANSACTIONS, isLoading: false, hasFetched: true })
            resolve()
          }, FAKE_LATENCY_MS)
        })
      },

      addTransaction: (data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({ transactions: [{ ...data, id: `t-${Date.now()}` }, ...get().transactions] })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

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