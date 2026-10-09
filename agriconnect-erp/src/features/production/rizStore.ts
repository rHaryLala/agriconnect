import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { RizRecolte, RizSechageEvent, RizDecorticage, RizVente } from "@/types/production"
import { SEED_RIZ_RECOLTES, SEED_RIZ_SECHAGE, SEED_RIZ_DECORTICAGE, SEED_RIZ_VENTES } from "./mockProductionData"
import { newId } from "@/lib/id"
import { useAuthStore } from "@/features/auth/authStore"
import { createDecorticage, createRecolte, createSechageEvent, fetchRiz, lotEnCours } from "./paddyApi"

const FAKE_LATENCY_MS = 500

interface RizState {
  recoltes: RizRecolte[]
  sechageEvents: RizSechageEvent[]
  decorticages: RizDecorticage[]
  ventes: RizVente[]
  isLoading: boolean
  hasFetched: boolean
  fetchAll: () => Promise<void>
  addRecolte: (data: Omit<RizRecolte, "id">) => Promise<void>
  addSechageEvent: (data: Omit<RizSechageEvent, "id">) => Promise<void>
  addDecorticage: (data: Omit<RizDecorticage, "id">) => Promise<void>
  addVente: (data: Omit<RizVente, "id">) => Promise<RizVente>
  linkInvoice: (id: string, invoiceId: string) => void
  deleteRecolte: (id: string) => void
  deleteSechageEvent: (id: string) => void
  deleteDecorticage: (id: string) => void
  deleteVente: (id: string) => void
}

export const useRizStore = create<RizState>()(
  persist(
    (set, get) => ({
      recoltes: [],
      sechageEvents: [],
      decorticages: [],
      ventes: [],
      isLoading: false,
      hasFetched: false,

      fetchAll: async () => {
        if (get().hasFetched) return
        set({ isLoading: true })
        try {
          const token = useAuthStore.getState().token
          const donnees = token
            ? await fetchRiz(token)
            : {
                recoltes: SEED_RIZ_RECOLTES,
                sechageEvents: SEED_RIZ_SECHAGE,
                decorticages: SEED_RIZ_DECORTICAGE,
              }
          // Les ventes restent locales : /paddy n'a aucune route de vente.
          set({ ...donnees, ventes: get().ventes.length > 0 ? get().ventes : SEED_RIZ_VENTES, hasFetched: true })
        } finally {
          set({ isLoading: false })
        }
      },

      addRecolte: async (data) => {
        const token = useAuthStore.getState().token
        const recolte = token ? await createRecolte(token, data) : { ...data, id: newId("rr") }
        set({ recoltes: [recolte, ...get().recoltes] })
      },

      // Une vague de sechage appartient a un lot. Faute de selecteur a l'ecran,
      // elle va sur le lot en cours le plus recent ; sans lot ouvert, l'erreur
      // remonte plutot que d'en creer un a l'aveugle.
      addSechageEvent: async (data) => {
        const token = useAuthStore.getState().token
        let event: RizSechageEvent = { ...data, id: newId("rs") }
        if (token) {
          const processId = await lotEnCours(token)
          if (!processId) throw new Error("Aucun lot de paddy en cours : enregistrez d'abord une recolte")
          event = await createSechageEvent(token, processId, data)
        }
        set({ sechageEvents: [event, ...get().sechageEvents] })
      },

      addDecorticage: async (data) => {
        const token = useAuthStore.getState().token
        let decorticage: RizDecorticage = { ...data, id: newId("rd") }
        if (token) {
          const processId = await lotEnCours(token)
          if (!processId) throw new Error("Aucun lot de paddy en cours : enregistrez d'abord une recolte")
          decorticage = await createDecorticage(token, processId, data)
        }
        set({ decorticages: [decorticage, ...get().decorticages] })
      },

      addVente: (data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            const vente: RizVente = { ...data, id: newId("rv") }
            set({ ventes: [vente, ...get().ventes] })
            resolve(vente)
          }, FAKE_LATENCY_MS)
        }),

      linkInvoice: (id, invoiceId) =>
        set({ ventes: get().ventes.map((v) => (v.id === id ? { ...v, invoiceId } : v)) }),

      deleteRecolte: (id) => set({ recoltes: get().recoltes.filter((r) => r.id !== id) }),
      deleteSechageEvent: (id) => set({ sechageEvents: get().sechageEvents.filter((e) => e.id !== id) }),
      deleteDecorticage: (id) => set({ decorticages: get().decorticages.filter((d) => d.id !== id) }),
      deleteVente: (id) => set({ ventes: get().ventes.filter((v) => v.id !== id) }),
    }),
    {
      name: "agriconnect-riz",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        recoltes: state.recoltes,
        sechageEvents: state.sechageEvents,
        decorticages: state.decorticages,
        ventes: state.ventes,
        hasFetched: state.hasFetched,
      }),
    }
  )
)
