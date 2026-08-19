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
  updateType: (id: string, label: string) => void
  removeType: (id: string) => void
  addEntry: (typeId: string, data: Omit<CustomTypeEntry, "id">) => Promise<void>
  updateEntry: (typeId: string, entryId: string, data: Omit<CustomTypeEntry, "id">) => Promise<void>
  deleteEntry: (typeId: string, entryId: string) => void
}

export const useCustomTypesStore = create<CustomTypesState>()(
  persist(
    (set, get) => ({
      types: [],
      addType: (label) => {
        const trimmed = label.trim()
        if (!trimmed) return
        set({ types: [...get().types, { id: `custom-${Date.now()}`, label: trimmed, entries: [] }] })
      },
      updateType: (id, label) => set({ types: get().types.map((t) => (t.id === id ? { ...t, label } : t)) }),
      removeType: (id) => set({ types: get().types.filter((t) => t.id !== id) }),
      addEntry: (typeId, data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({
              types: get().types.map((t) =>
                t.id === typeId ? { ...t, entries: [{ ...data, id: `entry-${Date.now()}` }, ...t.entries] } : t
              ),
            })
            resolve()
          }, FAKE_LATENCY_MS)
        }),
      updateEntry: (typeId, entryId, data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({
              types: get().types.map((t) =>
                t.id === typeId ? { ...t, entries: t.entries.map((e) => (e.id === entryId ? { ...data, id: entryId } : e)) } : t
              ),
            })
            resolve()
          }, FAKE_LATENCY_MS)
        }),
      deleteEntry: (typeId, entryId) =>
        set({
          types: get().types.map((t) => (t.id === typeId ? { ...t, entries: t.entries.filter((e) => e.id !== entryId) } : t)),
        }),
    }),
    { name: "agriconnect-custom-production-types" }
  )
)