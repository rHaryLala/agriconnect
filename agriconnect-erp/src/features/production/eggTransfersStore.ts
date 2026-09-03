import { create } from "zustand"
import type { EggTransfer } from "@/types/eggLocation"

const FAKE_LATENCY_MS = 500

const SEED_TRANSFERS: EggTransfer[] = [
  {
    id: "tr-1",
    date: "2026-08-15",
    from: "ferme",
    to: "magasinier",
    quantities: { gmNormal: 8, gmCasse: 0, pmNormal: 2, pmCasse: 0 },
    responsable: "Coulibaly A.",
    observation: "Livraison quotidienne",
  },
]

interface EggTransfersState {
  transfers: EggTransfer[]
  isLoading: boolean
  fetchAll: () => Promise<void>
  addTransfer: (data: Omit<EggTransfer, "id">) => Promise<void>
  deleteTransfer: (id: string) => void
}

export const useEggTransfersStore = create<EggTransfersState>((set, get) => ({
  transfers: [],
  isLoading: false,

  fetchAll: () =>
    new Promise((resolve) => {
      set({ isLoading: true })
      setTimeout(() => {
        set({ transfers: SEED_TRANSFERS, isLoading: false })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  addTransfer: (data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({ transfers: [{ ...data, id: `tr-${Date.now()}` }, ...get().transfers] })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  deleteTransfer: (id) => set({ transfers: get().transfers.filter((t) => t.id !== id) }),
}))