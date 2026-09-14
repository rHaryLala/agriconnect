import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface PoulardRaceProfile {
  id: string
  nom: string
}

interface PoulardRacesState {
  types: PoulardRaceProfile[]
  addType: (nom: string) => void
  updateType: (id: string, nom: string) => void
  removeType: (id: string) => void
}

export const usePoulardRacesStore = create<PoulardRacesState>()(
  persist(
    (set, get) => ({
      types: [
        { id: "poulard-race-kuroilier", nom: "Kuroilier" },
        { id: "poulard-race-kombo", nom: "Kombo" },
      ],
      addType: (nom) => {
        const trimmed = nom.trim()
        if (!trimmed || get().types.some((r) => r.nom === trimmed)) return
        set({ types: [...get().types, { id: `poulard-race-${Date.now()}`, nom: trimmed }] })
      },
      updateType: (id, nom) => set({ types: get().types.map((r) => (r.id === id ? { ...r, nom } : r)) }),
      removeType: (id) => set({ types: get().types.filter((r) => r.id !== id) }),
    }),
    { name: "agriconnect-poulard-races" }
  )
)
