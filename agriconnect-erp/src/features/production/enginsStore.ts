import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface EnginProfile {
  id: string
  nom: string
}

interface EnginsState {
  types: EnginProfile[]
  addType: (nom: string) => void
  updateType: (id: string, nom: string) => void
  removeType: (id: string) => void
}

export const useEnginsStore = create<EnginsState>()(
  persist(
    (set, get) => ({
      types: [
        { id: "engin-tracteur", nom: "Tracteur" },
        { id: "engin-motoculteur", nom: "Motoculteur" },
        { id: "engin-camion", nom: "Camion UAZ-01" },
        { id: "engin-groupe", nom: "Groupe électrogène" },
      ],
      addType: (nom) => {
        const trimmed = nom.trim()
        if (!trimmed || get().types.some((e) => e.nom === trimmed)) return
        set({ types: [...get().types, { id: `engin-${Date.now()}`, nom: trimmed }] })
      },
      updateType: (id, nom) => set({ types: get().types.map((e) => (e.id === id ? { ...e, nom } : e)) }),
      removeType: (id) => set({ types: get().types.filter((e) => e.id !== id) }),
    }),
    { name: "agriconnect-engins" }
  )
)
