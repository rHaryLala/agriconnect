import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Employe } from "@/types/personnel"
import { SEED_EMPLOYES } from "./mockPersonnelData"
import { newId } from "@/lib/id"
import { useAuthStore } from "@/features/auth/authStore"
import { createEmploye, fetchEmployes, updateEmploye } from "./personnelApi"

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

      fetchAll: async () => {
        if (get().hasFetched) return
        set({ isLoading: true })
        try {
          const token = useAuthStore.getState().token
          const employes = token ? await fetchEmployes(token) : SEED_EMPLOYES
          set({ employes, hasFetched: true })
        } finally {
          set({ isLoading: false })
        }
      },

      ensureSeeded: () => {
        if (get().hasFetched) return
        set({ employes: SEED_EMPLOYES, hasFetched: true })
      },

      addEmploye: async (data) => {
        const token = useAuthStore.getState().token
        const employe = token ? await createEmploye(token, data) : { ...data, id: newId("emp") }
        set({ employes: [...get().employes, employe] })
      },

      updateEmploye: async (id, data) => {
        const token = useAuthStore.getState().token
        const employe = token ? await updateEmploye(token, id, data) : { ...data, id }
        set({ employes: get().employes.map((e) => (e.id === id ? employe : e)) })
      },

      // Pas d'appel reseau : aucune route ne supprime un employe. La fiche
      // reste en base, seul l'affichage la retire.
      deleteEmploye: (id) => set({ employes: get().employes.filter((e) => e.id !== id) }),
    }),
    {
      name: "agriconnect-personnel",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ employes: state.employes, hasFetched: state.hasFetched }),
    }
  )
)
