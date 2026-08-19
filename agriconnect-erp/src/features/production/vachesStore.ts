import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface VacheProfile {
  id: string
  nom: string
}

interface VachesState {
  vaches: VacheProfile[]
  addVache: (nom: string) => void
  updateVache: (id: string, nom: string) => void
  removeVache: (id: string) => void
}

export const useVachesStore = create<VachesState>()(
  persist(
    (set, get) => ({
      vaches: [
        { id: "vache-1", nom: "Paika" },
        { id: "vache-2", nom: "Nirina" },
        { id: "vache-3", nom: "Fotsy" },
        { id: "vache-4", nom: "Happy" },
        { id: "vache-5", nom: "Mena" },
      ],
      addVache: (nom) => {
        const trimmed = nom.trim()
        if (!trimmed) return
        set({ vaches: [...get().vaches, { id: `vache-${Date.now()}`, nom: trimmed }] })
      },
      updateVache: (id, nom) => set({ vaches: get().vaches.map((v) => (v.id === id ? { ...v, nom } : v)) }),
      removeVache: (id) => set({ vaches: get().vaches.filter((v) => v.id !== id) }),
    }),
    { name: "agriconnect-vaches-profiles" }
  )
)