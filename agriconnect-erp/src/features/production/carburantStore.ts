import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { CarburantMouvement } from "@/types/production"
import { SEED_CARBURANT } from "./mockProductionData"

const FAKE_LATENCY_MS = 500

interface CarburantState {
  mouvements: CarburantMouvement[]
  isLoading: boolean
  hasFetched: boolean
  fetchAll: () => Promise<void>
  addMouvement: (data: Omit<CarburantMouvement, "id">) => Promise<void>
  updateMouvement: (id: string, data: Omit<CarburantMouvement, "id">) => Promise<void>
  deleteMouvement: (id: string) => void
}

export const useCarburantStore = create<CarburantState>()(
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
            set({ mouvements: SEED_CARBURANT, isLoading: false, hasFetched: true })
            resolve()
          }, FAKE_LATENCY_MS)
        })
      },

      addMouvement: (data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({ mouvements: [{ ...data, id: `carb-${Date.now()}` }, ...get().mouvements] })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      updateMouvement: (id, data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({ mouvements: get().mouvements.map((m) => (m.id === id ? { ...data, id } : m)) })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      deleteMouvement: (id) => set({ mouvements: get().mouvements.filter((m) => m.id !== id) }),
    }),
    {
      name: "agriconnect-carburant",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ mouvements: state.mouvements, hasFetched: state.hasFetched }),
    }
  )
)
