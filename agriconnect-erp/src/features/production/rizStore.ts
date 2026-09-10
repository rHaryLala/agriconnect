import { create } from "zustand"
import type { RizRecolte, RizSechageEvent, RizDecorticage, RizVente } from "@/types/production"
import { SEED_RIZ_RECOLTES, SEED_RIZ_SECHAGE, SEED_RIZ_DECORTICAGE, SEED_RIZ_VENTES } from "./mockProductionData"

const FAKE_LATENCY_MS = 500

interface RizState {
  recoltes: RizRecolte[]
  sechageEvents: RizSechageEvent[]
  decorticages: RizDecorticage[]
  ventes: RizVente[]
  isLoading: boolean
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

export const useRizStore = create<RizState>((set, get) => ({
  recoltes: [],
  sechageEvents: [],
  decorticages: [],
  ventes: [],
  isLoading: false,

  fetchAll: () =>
    new Promise((resolve) => {
      set({ isLoading: true })
      setTimeout(() => {
        set({
          recoltes: SEED_RIZ_RECOLTES,
          sechageEvents: SEED_RIZ_SECHAGE,
          decorticages: SEED_RIZ_DECORTICAGE,
          ventes: SEED_RIZ_VENTES,
          isLoading: false,
        })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  addRecolte: (data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({ recoltes: [{ ...data, id: `rr-${Date.now()}` }, ...get().recoltes] })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  addSechageEvent: (data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({ sechageEvents: [{ ...data, id: `rs-${Date.now()}` }, ...get().sechageEvents] })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  addDecorticage: (data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({ decorticages: [{ ...data, id: `rd-${Date.now()}` }, ...get().decorticages] })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  addVente: (data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const vente: RizVente = { ...data, id: `rv-${Date.now()}` }
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
}))
