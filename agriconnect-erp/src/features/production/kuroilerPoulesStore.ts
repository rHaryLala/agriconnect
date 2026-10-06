import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { KuroilerPoule, KuroilerPouleStatut, KuroilerPouleSuivi } from "@/types/production"
import { SEED_KUROILER_POULES, SEED_KUROILER_SUIVIS } from "./mockProductionData"
import { newId } from "@/lib/id"
import { fetchKuroilerPoules, createKuroilerPoule, recordSortiePoule, createSuiviPoule } from "./poultryApi"
import { useAuthStore } from "@/features/auth/authStore"

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

      fetchAll: async () => {
        if (get().hasFetched) return
        set({ isLoading: true })
        try {
          const token = useAuthStore.getState().token
          const { poules, suivis } = token
            ? await fetchKuroilerPoules(token)
            : { poules: SEED_KUROILER_POULES, suivis: SEED_KUROILER_SUIVIS }
          set({ poules, suivis, hasFetched: true })
        } finally {
          set({ isLoading: false })
        }
      },

      addPoule: async (data) => {
        const token = useAuthStore.getState().token
        const poule = token ? await createKuroilerPoule(token, data) : { ...data, id: newId("kp"), statut: "active" as const }
        set({ poules: [poule, ...get().poules] })
      },

      updatePoule: (id, data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({ poules: get().poules.map((p) => (p.id === id ? { ...p, ...data } : p)) })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      recordSortie: async (id, data) => {
        const token = useAuthStore.getState().token
        if (token) await recordSortiePoule(token, id, data)
        set({
          poules: get().poules.map((p) =>
            p.id === id ? { ...p, statut: data.statut, dateSortie: data.dateSortie, ponte: false, observation: data.observation } : p
          ),
        })
      },

      deletePoule: (id) =>
        set({ poules: get().poules.filter((p) => p.id !== id), suivis: get().suivis.filter((s) => s.pouleId !== id) }),

      addSuivi: async (data) => {
        const token = useAuthStore.getState().token
        const suivi = token ? await createSuiviPoule(token, data) : { ...data, id: newId("ks") }
        set({ suivis: [suivi, ...get().suivis] })
      },

      deleteSuivi: (id) => set({ suivis: get().suivis.filter((s) => s.id !== id) }),
    }),
    {
      name: "agriconnect-kuroiler-poules",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ poules: state.poules, suivis: state.suivis, hasFetched: state.hasFetched }),
    }
  )
)
