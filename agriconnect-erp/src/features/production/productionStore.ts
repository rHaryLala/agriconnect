import { create } from "zustand"
import type { PouleEntry, VacheEntry, KuroilerEntry, CultureEntry } from "@/types/production"
import { SEED_POULES, SEED_VACHES, SEED_KUROILER, SEED_CULTURES } from "./mockProductionData"
import { enqueue, registerReplayer } from "@/lib/offlineQueue"

const FAKE_LATENCY_MS = 500

interface ProductionState {
  poules: PouleEntry[]
  vaches: VacheEntry[]
  kuroiler: KuroilerEntry[]
  cultures: CultureEntry[]
  isLoading: boolean
  fetchAll: () => Promise<void>
  addPoule: (data: Omit<PouleEntry, "id">) => Promise<void>
  updatePoule: (id: string, data: Omit<PouleEntry, "id">) => Promise<void>
  addVache: (data: Omit<VacheEntry, "id">) => Promise<void>
  updateVache: (id: string, data: Omit<VacheEntry, "id">) => Promise<void>
  addKuroiler: (data: Omit<KuroilerEntry, "id">) => Promise<void>
  updateKuroiler: (id: string, data: Omit<KuroilerEntry, "id">) => Promise<void>
  addCulture: (data: Omit<CultureEntry, "id">) => Promise<void>
  updateCulture: (id: string, data: Omit<CultureEntry, "id">) => Promise<void>
  deletePoule: (id: string) => void
  deleteVache: (id: string) => void
  deleteKuroiler: (id: string) => void
  deleteCulture: (id: string) => void
}

export const useProductionStore = create<ProductionState>((set, get) => ({
  poules: [],
  vaches: [],
  kuroiler: [],
  cultures: [],
  isLoading: false,

  fetchAll: () =>
    new Promise((resolve) => {
      set({ isLoading: true })
      setTimeout(() => {
        set({ poules: SEED_POULES, vaches: SEED_VACHES, kuroiler: SEED_KUROILER, cultures: SEED_CULTURES, isLoading: false })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  addPoule: async (data) => {
    if (!navigator.onLine) {
      const optimisticEntry: PouleEntry = { ...data, id: `offline-${Date.now()}` }
      set({ poules: [optimisticEntry, ...get().poules] })
      await enqueue("production.poules", "add", data)
      return
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        set({ poules: [{ ...data, id: `p-${Date.now()}` }, ...get().poules] })
        resolve()
      }, FAKE_LATENCY_MS)
    })
  },

  updatePoule: (id, data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({ poules: get().poules.map((e) => (e.id === id ? { ...data, id } : e)) })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  addVache: (data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({ vaches: [{ ...data, id: `v-${Date.now()}` }, ...get().vaches] })
        resolve()
      }, FAKE_LATENCY_MS)
    }),
  updateVache: (id, data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({ vaches: get().vaches.map((e) => (e.id === id ? { ...data, id } : e)) })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  addKuroiler: (data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({ kuroiler: [{ ...data, id: `k-${Date.now()}` }, ...get().kuroiler] })
        resolve()
      }, FAKE_LATENCY_MS)
    }),
  updateKuroiler: (id, data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({ kuroiler: get().kuroiler.map((e) => (e.id === id ? { ...data, id } : e)) })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  addCulture: (data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({ cultures: [{ ...data, id: `c-${Date.now()}` }, ...get().cultures] })
        resolve()
      }, FAKE_LATENCY_MS)
    }),
  updateCulture: (id, data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({ cultures: get().cultures.map((e) => (e.id === id ? { ...data, id } : e)) })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  deletePoule: (id) => set({ poules: get().poules.filter((e) => e.id !== id) }),
  deleteVache: (id) => set({ vaches: get().vaches.filter((e) => e.id !== id) }),
  deleteKuroiler: (id) => set({ kuroiler: get().kuroiler.filter((e) => e.id !== id) }),
  deleteCulture: (id) => set({ cultures: get().cultures.filter((e) => e.id !== id) }),
}))

registerReplayer("production.poules", async () => {})