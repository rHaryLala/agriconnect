import { create } from "zustand"
import type { PoulardMouvement } from "@/types/production"
import { SEED_POULARD } from "./mockProductionData"

const FAKE_LATENCY_MS = 500

interface PoulardState {
  mouvements: PoulardMouvement[]
  isLoading: boolean
  fetchAll: () => Promise<void>
  addMouvement: (data: Omit<PoulardMouvement, "id">) => Promise<PoulardMouvement>
  linkInvoice: (id: string, invoiceId: string) => void
  deleteMouvement: (id: string) => void
}

export const usePoulardStore = create<PoulardState>((set, get) => ({
  mouvements: [],
  isLoading: false,

  fetchAll: () =>
    new Promise((resolve) => {
      set({ isLoading: true })
      setTimeout(() => {
        set({ mouvements: SEED_POULARD, isLoading: false })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

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
}))
