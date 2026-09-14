import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface EngraisTypeProfile {
  id: string
  nom: string
}

interface EngraisTypesState {
  types: EngraisTypeProfile[]
  addType: (nom: string) => void
  updateType: (id: string, nom: string) => void
  removeType: (id: string) => void
}

export const useEngraisTypesStore = create<EngraisTypesState>()(
  persist(
    (set, get) => ({
      types: [
        { id: "engrais-uree", nom: "Urée" },
        { id: "engrais-npk", nom: "NPK" },
        { id: "engrais-compost", nom: "Compost" },
        { id: "engrais-fumier", nom: "Fumier" },
      ],
      addType: (nom) => {
        const trimmed = nom.trim()
        if (!trimmed || get().types.some((e) => e.nom === trimmed)) return
        set({ types: [...get().types, { id: `engrais-${Date.now()}`, nom: trimmed }] })
      },
      updateType: (id, nom) => set({ types: get().types.map((e) => (e.id === id ? { ...e, nom } : e)) }),
      removeType: (id) => set({ types: get().types.filter((e) => e.id !== id) }),
    }),
    { name: "agriconnect-engrais-types" }
  )
)
