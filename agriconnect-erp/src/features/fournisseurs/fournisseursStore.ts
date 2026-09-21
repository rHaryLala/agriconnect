import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { AchatFournisseur, Fournisseur, PaiementFournisseur } from "@/types/fournisseur"
import { SEED_ACHATS, SEED_FOURNISSEURS, SEED_PAIEMENTS } from "./mockFournisseurData"
import { newId } from "@/lib/id"

const FAKE_LATENCY_MS = 500

interface FournisseursState {
  fournisseurs: Fournisseur[]
  achats: AchatFournisseur[]
  paiements: PaiementFournisseur[]
  isLoading: boolean
  hasFetched: boolean
  fetchAll: () => Promise<void>
  addFournisseur: (data: Omit<Fournisseur, "id">) => Promise<void>
  updateFournisseur: (id: string, data: Omit<Fournisseur, "id">) => Promise<void>
  deleteFournisseur: (id: string) => void
  addAchat: (data: Omit<AchatFournisseur, "id">) => Promise<void>
  addPaiement: (data: Omit<PaiementFournisseur, "id">) => Promise<void>
}

export const useFournisseursStore = create<FournisseursState>()(
  persist(
    (set, get) => ({
      fournisseurs: [],
      achats: [],
      paiements: [],
      isLoading: false,
      hasFetched: false,

      fetchAll: () => {
        if (get().hasFetched) return Promise.resolve()
        return new Promise((resolve) => {
          set({ isLoading: true })
          setTimeout(() => {
            set({
              fournisseurs: SEED_FOURNISSEURS,
              achats: SEED_ACHATS,
              paiements: SEED_PAIEMENTS,
              isLoading: false,
              hasFetched: true,
            })
            resolve()
          }, FAKE_LATENCY_MS)
        })
      },

      addFournisseur: (data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({ fournisseurs: [{ ...data, id: newId("fr") }, ...get().fournisseurs] })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      updateFournisseur: (id, data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({ fournisseurs: get().fournisseurs.map((f) => (f.id === id ? { ...data, id } : f)) })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      deleteFournisseur: (id) =>
        set({
          fournisseurs: get().fournisseurs.filter((f) => f.id !== id),
          achats: get().achats.filter((a) => a.fournisseurId !== id),
          paiements: get().paiements.filter((p) => p.fournisseurId !== id),
        }),

      addAchat: (data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            const achat: AchatFournisseur = { ...data, id: newId("ach") }
            const paiements = get().paiements
            set({
              achats: [achat, ...get().achats],
              paiements:
                achat.montantPaye > 0
                  ? [
                      {
                        id: newId("pay"),
                        fournisseurId: achat.fournisseurId,
                        achatId: achat.id,
                        date: achat.date,
                        montant: achat.montantPaye,
                        moyen: "especes",
                        reference: achat.reference,
                      },
                      ...paiements,
                    ]
                  : paiements,
            })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      addPaiement: (data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            const paiement: PaiementFournisseur = { ...data, id: newId("pay") }
            set({
              paiements: [paiement, ...get().paiements],
              achats: paiement.achatId
                ? get().achats.map((a) =>
                    a.id === paiement.achatId
                      ? { ...a, montantPaye: Math.min(a.montant, a.montantPaye + paiement.montant) }
                      : a,
                  )
                : get().achats,
            })
            resolve()
          }, FAKE_LATENCY_MS)
        }),
    }),
    {
      name: "agriconnect-fournisseurs",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        fournisseurs: state.fournisseurs,
        achats: state.achats,
        paiements: state.paiements,
        hasFetched: state.hasFetched,
      }),
    },
  ),
)
