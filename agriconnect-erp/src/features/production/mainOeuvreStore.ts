import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { MainOeuvreEntry } from "@/types/production"
import { SEED_MAIN_OEUVRE } from "./mockProductionData"
import { newId } from "@/lib/id"

const FAKE_LATENCY_MS = 500

interface MainOeuvreState {
  entries: MainOeuvreEntry[]
  isLoading: boolean
  hasFetched: boolean
  fetchAll: () => Promise<void>
  addEntry: (data: Omit<MainOeuvreEntry, "id">) => Promise<void>
  updateEntry: (id: string, data: Omit<MainOeuvreEntry, "id">) => Promise<void>
  deleteEntry: (id: string) => void
}

export const useMainOeuvreStore = create<MainOeuvreState>()(
  persist(
    (set, get) => ({
      entries: [],
      isLoading: false,
      hasFetched: false,

      fetchAll: () => {
        if (get().hasFetched) return Promise.resolve()
        return new Promise((resolve) => {
          set({ isLoading: true })
          setTimeout(() => {
            set({ entries: SEED_MAIN_OEUVRE, isLoading: false, hasFetched: true })
            resolve()
          }, FAKE_LATENCY_MS)
        })
      },

      addEntry: (data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({ entries: [{ ...data, id: newId("mo") }, ...get().entries] })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      updateEntry: (id, data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({ entries: get().entries.map((e) => (e.id === id ? { ...data, id } : e)) })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      deleteEntry: (id) => set({ entries: get().entries.filter((e) => e.id !== id) }),
    }),
    {
      name: "agriconnect-main-oeuvre",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ entries: state.entries, hasFetched: state.hasFetched }),
    }
  )
)
