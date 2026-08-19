import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CultureTypeProfile {
  id: string
  nom: string
}

interface CultureTypesState {
  types: CultureTypeProfile[]
  addType: (nom: string) => void
  updateType: (id: string, nom: string) => void
  removeType: (id: string) => void
}

export const useCultureTypesStore = create<CultureTypesState>()(
  persist(
    (set, get) => ({
      types: [
        { id: "culture-mais", nom: "Maïs" },
        { id: "culture-riz", nom: "Riz" },
        { id: "culture-soja", nom: "Soja" },
      ],
      addType: (nom) => {
        const trimmed = nom.trim()
        if (!trimmed || get().types.some((t) => t.nom === trimmed)) return
        set({ types: [...get().types, { id: `culture-${Date.now()}`, nom: trimmed }] })
      },
      updateType: (id, nom) => set({ types: get().types.map((t) => (t.id === id ? { ...t, nom } : t)) }),
      removeType: (id) => set({ types: get().types.filter((t) => t.id !== id) }),
    }),
    { name: "agriconnect-culture-types" }
  )
)