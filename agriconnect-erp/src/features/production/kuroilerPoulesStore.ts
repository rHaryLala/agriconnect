import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { KuroilerPoule, KuroilerPouleStatut, KuroilerPouleSuivi } from "@/types/production"
import { SEED_KUROILER_POULES, SEED_KUROILER_SUIVIS } from "./mockProductionData"
import { newId } from "@/lib/id"

const FAKE_LATENCY_MS = 500

interface SortieData {
  statut: Exclude<KuroilerPouleStatut, "active">
  dateSortie: string
  observation: string
}

interface KuroilerPoulesState {
  poules: KuroilerPoule[]
  suivis: KuroilerPouleSuivi[]
  isLoading: boolean
  hasFetched: boolean
  fetchAll: () => Promise<void>
  addPoule: (data: Omit<KuroilerPoule, "id" | "statut">) => Promise<void>
  updatePoule: (id: string, data: Omit<KuroilerPoule, "id" | "statut">) => Promise<void>
  recordSortie: (id: string, data: SortieData) => Promise<void>
  deletePoule: (id: string) => void
  addSuivi: (data: Omit<KuroilerPouleSuivi, "id">) => Promise<void>
  deleteSuivi: (id: string) => void
}

export const useKuroilerPoulesStore = create<KuroilerPoulesState>()(
  persist(
    (set, get) => ({
      poules: [],
      suivis: [],
      isLoading: false,
      hasFetched: false,

      fetchAll: () => {
        if (get().hasFetched) return Promise.resolve()
        return new Promise((resolve) => {
          set({ isLoading: true })
          setTimeout(() => {
            set({ poules: SEED_KUROILER_POULES, suivis: SEED_KUROILER_SUIVIS, isLoading: false, hasFetched: true })
            resolve()
          }, FAKE_LATENCY_MS)
        })
      },

      addPoule: (data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({ poules: [{ ...data, id: newId("kp"), statut: "active" }, ...get().poules] })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      updatePoule: (id, data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({ poules: get().poules.map((p) => (p.id === id ? { ...p, ...data } : p)) })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      recordSortie: (id, data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({
              poules: get().poules.map((p) =>
                p.id === id ? { ...p, statut: data.statut, dateSortie: data.dateSortie, ponte: false, observation: data.observation } : p
              ),
            })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      deletePoule: (id) =>
        set({ poules: get().poules.filter((p) => p.id !== id), suivis: get().suivis.filter((s) => s.pouleId !== id) }),

      addSuivi: (data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({ suivis: [{ ...data, id: newId("ks") }, ...get().suivis] })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      deleteSuivi: (id) => set({ suivis: get().suivis.filter((s) => s.id !== id) }),
    }),
    {
      name: "agriconnect-kuroiler-poules",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ poules: state.poules, suivis: state.suivis, hasFetched: state.hasFetched }),
    }
  )
)
