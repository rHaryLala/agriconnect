import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Client } from "@/types/client"
import { deactivateEmployeForClient, syncEmployeFromClient } from "@/features/personnel/clientSync"

const FAKE_LATENCY_MS = 500

const SEED_CLIENTS: Client[] = [
  { id: "cl-2", nom: "Store", type: "store" },
  { id: "cl-1", nom: "Cafétéria", type: "cafeteria" },
  { id: "cl-6", nom: "Production", type: "production" },
  { id: "cl-3", nom: "Hary Lala", type: "personnel", matriculeUaz: "UAZ-0231", telephone: "034 12 345 67", fonction: "Magasinier de la Ferme", departement: "Logistique" },
  { id: "cl-4", nom: "Restaurant LESOA Hideout", type: "externe", telephone: "032 98 765 43" },
]

interface ClientsState {
  clients: Client[]
  isLoading: boolean
  hasFetched: boolean
  fetchAll: () => Promise<void>
  addClient: (data: Omit<Client, "id">) => Promise<void>
  updateClient: (id: string, data: Omit<Client, "id">) => Promise<void>
  deleteClient: (id: string) => void
}

export const useClientsStore = create<ClientsState>()(
  persist(
    (set, get) => ({
      clients: [],
      isLoading: false,
      hasFetched: false,

      fetchAll: () => {
        if (get().hasFetched) return Promise.resolve()
        return new Promise((resolve) => {
          set({ isLoading: true })
          setTimeout(() => {
            set({ clients: SEED_CLIENTS, isLoading: false, hasFetched: true })
            resolve()
          }, FAKE_LATENCY_MS)
        })
      },

      addClient: (data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            const client: Client = { ...data, id: `cl-${Date.now()}` }
            set({ clients: [client, ...get().clients] })
            if (client.type === "personnel") syncEmployeFromClient(client)
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      updateClient: (id, data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            const client: Client = { ...data, id }
            set({ clients: get().clients.map((c) => (c.id === id ? client : c)) })
            if (client.type === "personnel") syncEmployeFromClient(client)
            else deactivateEmployeForClient(id)
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      deleteClient: (id) => {
        set({ clients: get().clients.filter((c) => c.id !== id) })
        deactivateEmployeForClient(id)
      },
    }),
    {
      name: "agriconnect-clients",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persisted, version) => {
        let state = persisted as ClientsState
        if (version < 1 && state.hasFetched) {
          const known = new Set((state.clients ?? []).map((c) => c.id))
          state = { ...state, clients: [...(state.clients ?? []), ...SEED_CLIENTS.filter((c) => !known.has(c.id))] }
        }
        if (version < 2) {
          state = { ...state, clients: (state.clients ?? []).filter((c) => (c.type as string) !== "magasinier") }
        }
        return state
      },
      partialize: (state) => ({ clients: state.clients, hasFetched: state.hasFetched }),
    }
  )
)
