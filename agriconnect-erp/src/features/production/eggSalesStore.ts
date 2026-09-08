import { create } from "zustand"
import type { EggSale } from "@/types/eggSale"

const FAKE_LATENCY_MS = 500

const SEED_SALES: EggSale[] = [
    { id: "es-1", date: "2026-08-15", clientId: "cl-2", quantities: { gmNormal: 8, gmCasse: 0, pmNormal: 2, pmCasse: 0 }, responsable: "Just_Blizzix (Magasinier)" }
]

interface EggSalesState {
  sales: EggSale[]
  isLoading: boolean
  fetchAll: () => Promise<void>
  addSale: (data: Omit<EggSale, "id">) => Promise<void>
  deleteSale: (id: string) => void
}

export const useEggSalesStore = create<EggSalesState>((set, get) => ({
  sales: [],
  isLoading: false,

  fetchAll: () =>
    new Promise((resolve) => {
      set({ isLoading: true })
      setTimeout(() => {
        set({ sales: SEED_SALES, isLoading: false })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  addSale: (data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({ sales: [{ ...data, id: `es-${Date.now()}` }, ...get().sales] })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  deleteSale: (id) => set({ sales: get().sales.filter((s) => s.id !== id) }),
}))