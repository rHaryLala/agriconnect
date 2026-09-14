import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ActiviteProfile {
  id: string
  nom: string
}

interface ActivitesState {
  types: ActiviteProfile[]
  addType: (nom: string) => void
  updateType: (id: string, nom: string) => void
  removeType: (id: string) => void
}

/** Field activities, named as the team names them on the paper sheets. */
export const useActivitesStore = create<ActivitesState>()(
  persist(
    (set, get) => ({
      types: [
        { id: "activite-mihava", nom: "Mihava" },
        { id: "activite-mamboly-vary", nom: "Mamboly vary" },
        { id: "activite-mijinja", nom: "Mijinja" },
        { id: "activite-mitery-ronono", nom: "Mitery ronono sy mitaona vilona" },
        { id: "activite-manangona-atody", nom: "Manangona atody" },
        { id: "activite-maraichere", nom: "Mikarakara maraîchère" },
      ],
      addType: (nom) => {
        const trimmed = nom.trim()
        if (!trimmed || get().types.some((a) => a.nom === trimmed)) return
        set({ types: [...get().types, { id: `activite-${Date.now()}`, nom: trimmed }] })
      },
      updateType: (id, nom) => set({ types: get().types.map((a) => (a.id === id ? { ...a, nom } : a)) }),
      removeType: (id) => set({ types: get().types.filter((a) => a.id !== id) }),
    }),
    { name: "agriconnect-activites" }
  )
)
