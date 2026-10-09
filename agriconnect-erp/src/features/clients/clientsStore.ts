import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Client } from "@/types/client"
import { deactivateEmployeForClient, syncEmployeFromClient } from "@/features/personnel/clientSync"
import { newId } from "@/lib/id"
import { useAuthStore } from "@/features/auth/authStore"
import { SEED_CLIENTS } from "./mockClientsData"
import { createClient, deleteClient as deleteClientRequest, fetchClients, updateClient } from "./clientsApi"

interface ClientsState {
  clients: Client[]
  isLoading: boolean
  hasFetched: boolean
  fetchAll: () => Promise<void>
  addClient: (data: Omit<Client, "id">) => Promise<void>
  updateClient: (id: string, data: Omit<Client, "id">) => Promise<void>
  deleteClient: (id: string) => Promise<void>
}

export const useClientsStore = create<ClientsState>()(
  persist(
    (set, get) => ({
      clients: [],
      isLoading: false,
      hasFetched: false,

      fetchAll: async () => {
        if (get().hasFetched) return
        set({ isLoading: true })
        try {
          const token = useAuthStore.getState().token
          const clients = token ? await fetchClients(token) : SEED_CLIENTS
          set({ clients, hasFetched: true })
        } finally {
          set({ isLoading: false })
        }
      },

      addClient: async (data) => {
        const token = useAuthStore.getState().token
        const client = token ? await createClient(token, data) : { ...data, id: newId("cl") }
        set({ clients: [client, ...get().clients] })
        if (client.type === "personnel") syncEmployeFromClient(client)
      },

      updateClient: async (id, data) => {
        const token = useAuthStore.getState().token
        const client = token ? await updateClient(token, id, data) : { ...data, id }
        set({ clients: get().clients.map((c) => (c.id === id ? client : c)) })
        if (client.type === "personnel") syncEmployeFromClient(client)
        else deactivateEmployeForClient(id)
      },

      // La suppression peut etre refusee si le client porte des factures ou
      // des transactions : on attend la reponse avant de retirer la ligne.
      deleteClient: async (id) => {
        const token = useAuthStore.getState().token
        if (token) await deleteClientRequest(token, id)
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
