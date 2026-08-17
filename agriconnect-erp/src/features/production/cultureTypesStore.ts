import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CultureTypesState {
  types: string[]
  addType: (label: string) => void
}

export const useCultureTypesStore = create<CultureTypesState>()(
  persist(
    (set, get) => ({
      types: ["Maïs", "Riz", "Soja"],
      addType: (label) => {
        const trimmed = label.trim()
        if (!trimmed || get().types.includes(trimmed)) return
        set({ types: [...get().types, trimmed] })
      },
    }),
    { name: "agriconnect-culture-types" }
  )
)