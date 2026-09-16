import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Employe } from "@/types/personnel"
import { SEED_EMPLOYES } from "./mockPersonnelData"

const FAKE_LATENCY_MS = 500

interface PersonnelState {
  employes: Employe[]
  isLoading: boolean
  hasFetched: boolean
  fetchAll: () => Promise<void>
  ensureSeeded: () => void
  addEmploye: (data: Omit<Employe, "id">) => Promise<void>
  updateEmploye: (id: string, data: Omit<Employe, "id">) => Promise<void>
  deleteEmploye: (id: string) => void
}

export const usePersonnelStore = create<PersonnelState>()(
  persist(
    (set, get) => ({
      employes: [],
      isLoading: false,
      hasFetched: false,

      fetchAll: () => {
        if (get().hasFetched) return Promise.resolve()
        return new Promise((resolve) => {
          set({ isLoading: true })
          setTimeout(() => {
            set({ employes: SEED_EMPLOYES, isLoading: false, hasFetched: true })
            resolve()
          }, FAKE_LATENCY_MS)
        })
      },

      ensureSeeded: () => {
        if (get().hasFetched) return
        set({ employes: SEED_EMPLOYES, hasFetched: true })
      },

      addEmploye: (data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({ employes: [...get().employes, { ...data, id: `emp-${Date.now()}` }] })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      updateEmploye: (id, data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({ employes: get().employes.map((e) => (e.id === id ? { ...data, id } : e)) })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      deleteEmploye: (id) => set({ employes: get().employes.filter((e) => e.id !== id) }),
    }),
    {
      name: "agriconnect-personnel",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ employes: state.employes, hasFetched: state.hasFetched }),
    }
  )
)
