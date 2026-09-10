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
  addSale: (data: Omit<EggSale, "id">) => Promise<EggSale>
  linkInvoice: (id: string, invoiceId: string) => void
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
        const sale: EggSale = { ...data, id: `es-${Date.now()}` }
        set({ sales: [sale, ...get().sales] })
        resolve(sale)
      }, FAKE_LATENCY_MS)
    }),

  linkInvoice: (id, invoiceId) =>
    set({ sales: get().sales.map((s) => (s.id === id ? { ...s, invoiceId } : s)) }),

  deleteSale: (id) => set({ sales: get().sales.filter((s) => s.id !== id) }),
}))