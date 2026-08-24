import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CycleEtapeProfile {
  id: string
  nom: string
}

interface CycleEtapesState {
  etapes: CycleEtapeProfile[]
  addEtape: (nom: string) => void
  updateEtape: (id: string, nom: string) => void
  removeEtape: (id: string) => void
}

export const useCycleEtapesStore = create<CycleEtapesState>()(
  persist(
    (set, get) => ({
      etapes: [
        { id: "etape-demarrage", nom: "Démarrage" },
        { id: "etape-croissance", nom: "Croissance" },
        { id: "etape-fin-cycle", nom: "Fin de cycle" },
      ],
      addEtape: (nom) => {
        const trimmed = nom.trim()
        if (!trimmed || get().etapes.some((e) => e.nom === trimmed)) return
        set({ etapes: [...get().etapes, { id: `etape-${Date.now()}`, nom: trimmed }] })
      },
      updateEtape: (id, nom) => set({ etapes: get().etapes.map((e) => (e.id === id ? { ...e, nom } : e)) }),
      removeEtape: (id) => set({ etapes: get().etapes.filter((e) => e.id !== id) }),
    }),
    { name: "agriconnect-cycle-etapes" }
  )
)