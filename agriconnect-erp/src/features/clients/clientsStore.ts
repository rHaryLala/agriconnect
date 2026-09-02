import { create } from "zustand"
import type { Client } from "@/types/client"

const FAKE_LATENCY_MS = 500

const SEED_CLIENTS: Client[] = [
  { id: "cl-1", nom: "Cafétéria", type: "cafeteria" },
  { id: "cl-2", nom: "Store", type: "store" },
  { id: "cl-3", nom: "Hary Lala", type: "personnel", matriculeUaz: "UAZ-0231", telephone: "034 12 345 67" },
  { id: "cl-4", nom: "Restaurant Belle Vue", type: "externe", telephone: "032 98 765 43" },
]

interface ClientsState {
  clients: Client[]
  isLoading: boolean
  fetchAll: () => Promise<void>
  addClient: (data: Omit<Client, "id">) => Promise<void>
  updateClient: (id: string, data: Omit<Client, "id">) => Promise<void>
  deleteClient: (id: string) => void
}

export const useClientsStore = create<ClientsState>((set, get) => ({
  clients: [],
  isLoading: false,

  fetchAll: () =>
    new Promise((resolve) => {
      set({ isLoading: true })
      setTimeout(() => {
        set({ clients: SEED_CLIENTS, isLoading: false })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  addClient: (data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({ clients: [{ ...data, id: `cl-${Date.now()}` }, ...get().clients] })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  updateClient: (id, data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({ clients: get().clients.map((c) => (c.id === id ? { ...data, id } : c)) })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  deleteClient: (id) => set({ clients: get().clients.filter((c) => c.id !== id) }),
}))