import { create } from "zustand"
import type { BovinAnimal, BovinSortieType } from "@/types/production"
import { SEED_BOVINS } from "./mockProductionData"

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
  fetchAll: () => Promise<void>
  addAnimal: (data: Omit<BovinAnimal, "id" | "statut">) => Promise<void>
  recordSortie: (id: string, data: SortieData) => Promise<void>
  deleteAnimal: (id: string) => void
}

export const useBovinsStore = create<BovinsState>((set, get) => ({
  animaux: [],
  isLoading: false,

  fetchAll: () =>
    new Promise((resolve) => {
      set({ isLoading: true })
      setTimeout(() => {
        set({ animaux: SEED_BOVINS, isLoading: false })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  addAnimal: (data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const animal: BovinAnimal = { ...data, id: `b-${Date.now()}`, statut: "present" }
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
}))
