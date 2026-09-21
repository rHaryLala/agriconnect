import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { EngraisApplication } from "@/types/production"
import { SEED_ENGRAIS } from "./mockProductionData"
import { newId } from "@/lib/id"

const FAKE_LATENCY_MS = 500

interface EngraisState {
  applications: EngraisApplication[]
  isLoading: boolean
  hasFetched: boolean
  fetchAll: () => Promise<void>
  addApplication: (data: Omit<EngraisApplication, "id">) => Promise<void>
  updateApplication: (id: string, data: Omit<EngraisApplication, "id">) => Promise<void>
  deleteApplication: (id: string) => void
}

export const useEngraisStore = create<EngraisState>()(
  persist(
    (set, get) => ({
      applications: [],
      isLoading: false,
      hasFetched: false,

      fetchAll: () => {
        if (get().hasFetched) return Promise.resolve()
        return new Promise((resolve) => {
          set({ isLoading: true })
          setTimeout(() => {
            set({ applications: SEED_ENGRAIS, isLoading: false, hasFetched: true })
            resolve()
          }, FAKE_LATENCY_MS)
        })
      },

      addApplication: (data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({ applications: [{ ...data, id: newId("eng") }, ...get().applications] })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      updateApplication: (id, data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({ applications: get().applications.map((a) => (a.id === id ? { ...data, id } : a)) })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      deleteApplication: (id) => set({ applications: get().applications.filter((a) => a.id !== id) }),
    }),
    {
      name: "agriconnect-engrais",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ applications: state.applications, hasFetched: state.hasFetched }),
    }
  )
)
