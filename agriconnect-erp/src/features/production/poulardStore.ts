import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { PoulardMouvement } from "@/types/production"
import { SEED_POULARD } from "./mockProductionData"

const FAKE_LATENCY_MS = 500

interface PoulardState {
  mouvements: PoulardMouvement[]
  isLoading: boolean
  hasFetched: boolean
  fetchAll: () => Promise<void>
  addMouvement: (data: Omit<PoulardMouvement, "id">) => Promise<PoulardMouvement>
  linkInvoice: (id: string, invoiceId: string) => void
  deleteMouvement: (id: string) => void
}

export const usePoulardStore = create<PoulardState>()(
  persist(
    (set, get) => ({
      mouvements: [],
      isLoading: false,
      hasFetched: false,

      fetchAll: () => {
        if (get().hasFetched) return Promise.resolve()
        return new Promise((resolve) => {
          set({ isLoading: true })
          setTimeout(() => {
            set({ mouvements: SEED_POULARD, isLoading: false, hasFetched: true })
            resolve()
          }, FAKE_LATENCY_MS)
        })
      },

      addMouvement: (data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            const mouvement: PoulardMouvement = { ...data, id: `pl-${Date.now()}` }
            set({ mouvements: [mouvement, ...get().mouvements] })
            resolve(mouvement)
          }, FAKE_LATENCY_MS)
        }),

      linkInvoice: (id, invoiceId) =>
        set({ mouvements: get().mouvements.map((m) => (m.id === id ? { ...m, invoiceId } : m)) }),

      deleteMouvement: (id) => set({ mouvements: get().mouvements.filter((m) => m.id !== id) }),
    }),
    {
      name: "agriconnect-poulard",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ mouvements: state.mouvements, hasFetched: state.hasFetched }),
    }
  )
)
