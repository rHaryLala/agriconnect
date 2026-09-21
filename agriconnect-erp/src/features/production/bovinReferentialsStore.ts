import { create } from "zustand"
import { persist } from "zustand/middleware"
import { newId } from "@/lib/id"

export interface BovinReferentialProfile {
  id: string
  nom: string
}

interface ReferentialState {
  types: BovinReferentialProfile[]
  addType: (nom: string) => void
  updateType: (id: string, nom: string) => void
  removeType: (id: string) => void
}

function buildStore(storageKey: string, idPrefix: string, seed: BovinReferentialProfile[]) {
  return create<ReferentialState>()(
    persist(
      (set, get) => ({
        types: seed,
        addType: (nom) => {
          const trimmed = nom.trim()
          if (!trimmed || get().types.some((t) => t.nom === trimmed)) return
          set({ types: [...get().types, { id: newId(idPrefix), nom: trimmed }] })
        },
        updateType: (id, nom) => set({ types: get().types.map((t) => (t.id === id ? { ...t, nom } : t)) }),
        removeType: (id) => set({ types: get().types.filter((t) => t.id !== id) }),
      }),
      { name: storageKey }
    )
  )
}

export const useBovinTypesStore = buildStore("agriconnect-bovin-types", "bovin-type", [
  { id: "bovin-type-veau", nom: "Veau" },
  { id: "bovin-type-genisse", nom: "Génisse" },
  { id: "bovin-type-vache", nom: "Vache" },
  { id: "bovin-type-taureau", nom: "Taureau" },
])

export const useBovinRacesStore = buildStore("agriconnect-bovin-races", "bovin-race", [
  { id: "bovin-race-zebu", nom: "Zébu" },
  { id: "bovin-race-rana", nom: "Rana" },
  { id: "bovin-race-pie-rouge", nom: "Pie rouge" },
  { id: "bovin-race-holstein", nom: "Holstein" },
])
