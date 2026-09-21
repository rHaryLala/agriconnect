import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { BovinAnimal, BovinSortieType } from "@/types/production"
import { SEED_BOVINS } from "./mockProductionData"
import { newId } from "@/lib/id"

const FAKE_LATENCY_MS = 500

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

      fetchAll: () => {
        if (get().hasFetched) return Promise.resolve()
        return new Promise((resolve) => {
          set({ isLoading: true })
          setTimeout(() => {
            set({ animaux: SEED_BOVINS, isLoading: false, hasFetched: true })
            resolve()
          }, FAKE_LATENCY_MS)
        })
      },

      addAnimal: (data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            const animal: BovinAnimal = { ...data, id: newId("b"), statut: "present" }
            set({ animaux: [animal, ...get().animaux] })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      recordSortie: (id, data) =>
        new Promise((resolve) => {
          setTimeout(() => {
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
            resolve()
          }, FAKE_LATENCY_MS)
        }),

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
