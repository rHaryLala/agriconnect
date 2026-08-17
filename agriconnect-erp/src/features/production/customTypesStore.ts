import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CustomTypeEntry {
  id: string
  date: string
  quantite: number
  unite: string
  notes: string
}

export interface CustomProductionType {
  id: string
  label: string
  entries: CustomTypeEntry[]
}

const FAKE_LATENCY_MS = 400

interface CustomTypesState {
  types: CustomProductionType[]
  addType: (label: string) => void
  addEntry: (typeId: string, data: Omit<CustomTypeEntry, "id">) => Promise<void>
  deleteEntry: (typeId: string, entryId: string) => void
}

export const useCustomTypesStore = create<CustomTypesState>()(
  persist(
    (set, get) => ({
      types: [],

      addType: (label) => {
        const trimmed = label.trim()
        if (!trimmed) return
        const id = `custom-${Date.now()}`
        set({ types: [...get().types, { id, label: trimmed, entries: [] }] })
      },

      addEntry: (typeId, data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({
              types: get().types.map((t) =>
                t.id === typeId
                  ? { ...t, entries: [{ ...data, id: `entry-${Date.now()}` }, ...t.entries] }
                  : t
              ),
            })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      deleteEntry: (typeId, entryId) =>
        set({
          types: get().types.map((t) =>
            t.id === typeId ? { ...t, entries: t.entries.filter((e) => e.id !== entryId) } : t
          ),
        }),
    }),
    { name: "agriconnect-custom-production-types" }
  )
)