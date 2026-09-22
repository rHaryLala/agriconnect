import { create } from "zustand"
import { persist } from "zustand/middleware"
import { newId } from "@/lib/id"

export interface CageProfile {
  id: string
  nom: string
  capaciteMax: number
}

function normaliseCageName(nom: string): string {
  return nom.trim().toUpperCase()
}

interface CagesState {
  cages: CageProfile[]
  addCage: (nom: string, capaciteMax: number) => void
  updateCage: (id: string, data: { nom: string; capaciteMax: number }) => void
  removeCage: (id: string) => void
}

export const useCagesStore = create<CagesState>()(
  persist(
    (set, get) => ({
      cages: [
        { id: "cage-1", nom: "C1", capaciteMax: 5 },
        { id: "cage-2", nom: "C2", capaciteMax: 5 },
        { id: "cage-3", nom: "C3", capaciteMax: 5 },
        { id: "cage-4", nom: "C4", capaciteMax: 5 },
      ],
      addCage: (nom, capaciteMax) => {
        const normalised = normaliseCageName(nom)
        if (!normalised) return
        set({ cages: [...get().cages, { id: newId("cage"), nom: normalised, capaciteMax }] })
      },
      updateCage: (id, data) =>
        set({
          cages: get().cages.map((c) =>
            c.id === id ? { ...c, nom: normaliseCageName(data.nom) || c.nom, capaciteMax: data.capaciteMax } : c,
          ),
        }),
      removeCage: (id) => set({ cages: get().cages.filter((c) => c.id !== id) }),
    }),
    {
      name: "agriconnect-cages-profiles",
      version: 1,
      migrate: (persisted) => {
        const state = persisted as CagesState
        return { ...state, cages: (state.cages ?? []).map((c) => ({ ...c, nom: normaliseCageName(c.nom) })) }
      },
    }
  )
)
