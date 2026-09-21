import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { newId } from "@/lib/id"

export interface Regularisation {
  id: string
  invoiceId: string
  date: string
  montant: number
  regularisePar: string
}

interface RegularisationsState {
  regularisations: Regularisation[]
  addRegularisation: (data: Omit<Regularisation, "id">) => void
  deleteRegularisation: (id: string) => void
}

export const useRegularisationsStore = create<RegularisationsState>()(
  persist(
    (set, get) => ({
      regularisations: [],
      addRegularisation: (data) =>
        set({ regularisations: [{ ...data, id: newId("reg") }, ...get().regularisations] }),
      deleteRegularisation: (id) => set({ regularisations: get().regularisations.filter((r) => r.id !== id) }),
    }),
    {
      name: "agriconnect-regularisations",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
