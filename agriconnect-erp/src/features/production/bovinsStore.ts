import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { BovinAnimal, BovinSortieType } from "@/types/production"
import { SEED_BOVINS } from "./mockProductionData"
import { newId } from "@/lib/id"
import { fetchBovins, createBovin, recordSortieBovin } from "./bovinsApi"
import { useAuthStore } from "@/features/auth/authStore"

interface SortieData {
  dateSortie: string
  typeSortie: BovinSortieType
  clientId?: string
  prixVente?: number
  signataire: string
  observation: string
}

interface BovinsState {
  animaux: BovinAnimal[]
  isLoading: boolean
  hasFetched: boolean
  fetchAll: () => Promise<void>
  addAnimal: (data: Omit<BovinAnimal, "id" | "statut">) => Promise<void>
  recordSortie: (id: string, data: SortieData) => Promise<void>
  deleteAnimal: (id: string) => void
}

export const useBovinsStore = create<BovinsState>()(
  persist(
    (set, get) => ({
      animaux: [],
      isLoading: false,
      hasFetched: false,

      fetchAll: async () => {
        if (get().hasFetched) return
        set({ isLoading: true })
        try {
          const token = useAuthStore.getState().token
          set({ animaux: token ? await fetchBovins(token) : SEED_BOVINS, hasFetched: true })
        } finally {
          set({ isLoading: false })
        }
      },

      addAnimal: async (data) => {
        const token = useAuthStore.getState().token
        const animal: BovinAnimal = token
          ? await createBovin(token, data)
          : { ...data, id: newId("b"), statut: "present" }
        set({ animaux: [animal, ...get().animaux] })
      },

      recordSortie: async (id, data) => {
        const token = useAuthStore.getState().token
        if (token) await recordSortieBovin(token, id, data)
        set({
          animaux: get().animaux.map((a) =>
            a.id === id
              ? {
                  ...a,
                  statut: data.typeSortie === "vente" ? "vendu" : "mort",
                  dateSortie: data.dateSortie,
                  typeSortie: data.typeSortie,
                  clientId: data.clientId,
                  prixVente: data.prixVente,
                  signataire: data.signataire,
                  observation: data.observation,
                }
              : a
          ),
        })
      },

      deleteAnimal: (id) => set({ animaux: get().animaux.filter((a) => a.id !== id) }),
    }),
    {
      name: "agriconnect-bovins",
      version: 1,
      migrate: (persisted, version) => {
        const state = persisted as BovinsState
        if (version < 1) {
          return { ...state, animaux: (state.animaux ?? []).map((a) => ({ ...a, race: a.race ?? "", type: a.type ?? "" })) }
        }
        return state
      },
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ animaux: state.animaux, hasFetched: state.hasFetched }),
    }
  )
)
