import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { TransactionType } from "@/types/finance"
import { newId } from "@/lib/id"

export interface CategoryProfile {
  id: string
  nom: string
}

const DEFAULT_DEPENSES: CategoryProfile[] = [
  { id: "dep-aliments", nom: "Aliments pour animaux" },
  { id: "dep-gasoil", nom: "Gasoil et essences" },
  { id: "dep-salaires", nom: "Salaires du personnel" },
  { id: "dep-transport", nom: "Transport" },
  { id: "dep-location-engins", nom: "Location de matériels, engins et tracteur" },
  { id: "dep-entretien", nom: "Entretien du matériel et des installations" },
  { id: "dep-charges-fixes", nom: "Charges fixes (eau, électricité)" },
]

const DEFAULT_RECETTES: CategoryProfile[] = [
  { id: "rec-oeufs-pondeuses", nom: "Vente d'œufs — poules pondeuses" },
  { id: "rec-oeufs-kuroiler", nom: "Vente d'œufs — Kuroiler" },
  { id: "rec-lait", nom: "Vente de lait" },
  { id: "rec-poulets", nom: "Vente de poulets" },
  { id: "rec-bovins", nom: "Vente de bœufs et vaches" },
  { id: "rec-recoltes", nom: "Vente de récoltes" },
]

function mergeDefaults(persisted: CategoryProfile[], defaults: CategoryProfile[]): CategoryProfile[] {
  const known = new Set(persisted.map((c) => c.id))
  return [...persisted, ...defaults.filter((c) => !known.has(c.id))]
}

interface CategoriesState {
  depense: CategoryProfile[]
  recette: CategoryProfile[]
  addCategory: (type: TransactionType, nom: string) => void
  updateCategory: (type: TransactionType, id: string, nom: string) => void
  removeCategory: (type: TransactionType, id: string) => void
}

export const useCategoriesStore = create<CategoriesState>()(
  persist(
    (set, get) => ({
      depense: DEFAULT_DEPENSES,
      recette: DEFAULT_RECETTES,
      addCategory: (type, nom) => {
        const trimmed = nom.trim()
        if (!trimmed) return
        set({ [type]: [...get()[type], { id: newId(type), nom: trimmed }] } as Partial<CategoriesState>)
      },
      updateCategory: (type, id, nom) =>
        set({ [type]: get()[type].map((c) => (c.id === id ? { ...c, nom } : c)) } as Partial<CategoriesState>),
      removeCategory: (type, id) =>
        set({ [type]: get()[type].filter((c) => c.id !== id) } as Partial<CategoriesState>),
    }),
    {
      name: "agriconnect-finance-categories",
      version: 1,
      migrate: (persisted, version) => {
        const state = persisted as CategoriesState
        if (version < 1) {
          return {
            ...state,
            depense: mergeDefaults(state.depense ?? [], DEFAULT_DEPENSES),
            recette: mergeDefaults(state.recette ?? [], DEFAULT_RECETTES),
          }
        }
        return state
      },
    }
  )
)
