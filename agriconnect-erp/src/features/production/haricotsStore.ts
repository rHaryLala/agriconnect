import { create } from "zustand"
import type { HaricotMouvement } from "@/types/production"
import { SEED_HARICOTS } from "./mockProductionData"

const FAKE_LATENCY_MS = 500

interface HaricotsState {
  mouvements: HaricotMouvement[]
  isLoading: boolean
  fetchAll: () => Promise<void>
  addMouvement: (data: Omit<HaricotMouvement, "id">) => Promise<HaricotMouvement>
  linkInvoice: (id: string, invoiceId: string) => void
  deleteMouvement: (id: string) => void
}

export const useHaricotsStore = create<HaricotsState>((set, get) => ({
  mouvements: [],
  isLoading: false,

  fetchAll: () =>
    new Promise((resolve) => {
      set({ isLoading: true })
      setTimeout(() => {
        set({ mouvements: SEED_HARICOTS, isLoading: false })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  addMouvement: (data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const mouvement: HaricotMouvement = { ...data, id: `hs-${Date.now()}` }
        set({ mouvements: [mouvement, ...get().mouvements] })
        resolve(mouvement)
      }, FAKE_LATENCY_MS)
    }),

  linkInvoice: (id, invoiceId) =>
    set({ mouvements: get().mouvements.map((m) => (m.id === id ? { ...m, invoiceId } : m)) }),

  deleteMouvement: (id) => set({ mouvements: get().mouvements.filter((m) => m.id !== id) }),
}))
