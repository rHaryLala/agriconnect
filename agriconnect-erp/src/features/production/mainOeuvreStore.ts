import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { MainOeuvreEntry } from "@/types/production"
import { SEED_MAIN_OEUVRE } from "./mockProductionData"
import { newId } from "@/lib/id"
import { useAuthStore } from "@/features/auth/authStore"
import { createEntry, deleteEntry, fetchMainOeuvre, updateEntry } from "./laborApi"

interface MainOeuvreState {
  entries: MainOeuvreEntry[]
  isLoading: boolean
  hasFetched: boolean
  fetchAll: () => Promise<void>
  addEntry: (data: Omit<MainOeuvreEntry, "id">) => Promise<void>
  updateEntry: (id: string, data: Omit<MainOeuvreEntry, "id">) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
}

export const useMainOeuvreStore = create<MainOeuvreState>()(
  persist(
    (set, get) => ({
      entries: [],
      isLoading: false,
      hasFetched: false,

      fetchAll: async () => {
        if (get().hasFetched) return
        set({ isLoading: true })
        try {
          const token = useAuthStore.getState().token
          const entries = token ? await fetchMainOeuvre(token) : SEED_MAIN_OEUVRE
          set({ entries, hasFetched: true })
        } finally {
          set({ isLoading: false })
        }
      },

      addEntry: async (data) => {
        const token = useAuthStore.getState().token
        const entry = token ? await createEntry(token, data) : { ...data, id: newId("mo") }
        set({ entries: [entry, ...get().entries] })
      },

      updateEntry: async (id, data) => {
        const token = useAuthStore.getState().token
        const entry = token ? await updateEntry(token, id, data) : { ...data, id }
        set({ entries: get().entries.map((e) => (e.id === id ? entry : e)) })
      },

      deleteEntry: async (id) => {
        const token = useAuthStore.getState().token
        if (token) await deleteEntry(token, id)
        set({ entries: get().entries.filter((e) => e.id !== id) })
      },
    }),
    {
      name: "agriconnect-main-oeuvre",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ entries: state.entries, hasFetched: state.hasFetched }),
    }
  )
)
