import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CageProfile {
  id: string
  nom: string
  capaciteMax: number
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
        const trimmed = nom.trim()
        if (!trimmed) return
        set({ cages: [...get().cages, { id: `cage-${Date.now()}`, nom: trimmed, capaciteMax }] })
      },
      updateCage: (id, data) =>
        set({ cages: get().cages.map((c) => (c.id === id ? { ...c, nom: data.nom, capaciteMax: data.capaciteMax } : c)) }),
      removeCage: (id) => set({ cages: get().cages.filter((c) => c.id !== id) }),
    }),
    { name: "agriconnect-cages-profiles" }
  )
)