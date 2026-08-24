import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { TransactionType } from "@/types/finance"

export interface CategoryProfile {
  id: string
  nom: string
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
      depense: [
        { id: "dep-aliments", nom: "Aliments pour animaux" },
        { id: "dep-salaires", nom: "Salaires du personnel" },
        { id: "dep-transport", nom: "Transport" },
        { id: "dep-entretien", nom: "Entretien du matériel et des installations" },
        { id: "dep-charges-fixes", nom: "Charges fixes (eau, électricité)" },
      ],
      recette: [
        { id: "rec-oeufs", nom: "Vente d'œufs" },
        { id: "rec-lait", nom: "Vente de lait" },
        { id: "rec-poulets", nom: "Vente de poulets" },
        { id: "rec-recoltes", nom: "Vente de récoltes" },
      ],
      addCategory: (type, nom) => {
        const trimmed = nom.trim()
        if (!trimmed) return
        set({ [type]: [...get()[type], { id: `${type}-${Date.now()}`, nom: trimmed }] } as Partial<CategoriesState>)
      },
      updateCategory: (type, id, nom) =>
        set({ [type]: get()[type].map((c) => (c.id === id ? { ...c, nom } : c)) } as Partial<CategoriesState>),
      removeCategory: (type, id) =>
        set({ [type]: get()[type].filter((c) => c.id !== id) } as Partial<CategoriesState>),
    }),
    { name: "agriconnect-finance-categories" }
  )
)