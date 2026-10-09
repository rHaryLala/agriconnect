import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { AchatFournisseur, Fournisseur, PaiementFournisseur } from "@/types/fournisseur"
import { SEED_ACHATS, SEED_FOURNISSEURS, SEED_PAIEMENTS } from "./mockFournisseurData"
import { newId } from "@/lib/id"
import { useAuthStore } from "@/features/auth/authStore"
import { createAchat, createFournisseur, createPaiement, fetchFournisseurs, updateFournisseur } from "./fournisseursApi"

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

      fetchAll: async () => {
        if (get().hasFetched) return
        set({ isLoading: true })
        try {
          const token = useAuthStore.getState().token
          const donnees = token
            ? await fetchFournisseurs(token)
            : { fournisseurs: SEED_FOURNISSEURS, achats: SEED_ACHATS, paiements: SEED_PAIEMENTS }
          set({ ...donnees, hasFetched: true })
        } finally {
          set({ isLoading: false })
        }
      },

      addFournisseur: async (data) => {
        const token = useAuthStore.getState().token
        const fournisseur = token ? await createFournisseur(token, data) : { ...data, id: newId("fr") }
        set({ fournisseurs: [fournisseur, ...get().fournisseurs] })
      },

      updateFournisseur: async (id, data) => {
        const token = useAuthStore.getState().token
        const fournisseur = token ? await updateFournisseur(token, id, data) : { ...data, id }
        set({ fournisseurs: get().fournisseurs.map((f) => (f.id === id ? fournisseur : f)) })
      },

      // Pas d'appel reseau : aucune route ne supprime un fournisseur, et c'est
      // voulu cote backend (onDelete: Restrict sur les achats). La suppression
      // reste locale a l'affichage.
      deleteFournisseur: (id) =>
        set({
          fournisseurs: get().fournisseurs.filter((f) => f.id !== id),
          achats: get().achats.filter((a) => a.fournisseurId !== id),
          paiements: get().paiements.filter((p) => p.fournisseurId !== id),
        }),

      addAchat: async (data) => {
        const token = useAuthStore.getState().token
        const achat = token ? await createAchat(token, data) : { ...data, id: newId("ach") }

        // Un achat est cree impaye : l'acompte saisi a l'ecran est enregistre
        // par la route des paiements, qui recalcule aussi le statut.
        let paiement: PaiementFournisseur | null = null
        if (data.montantPaye > 0) {
          const brouillon = {
            fournisseurId: achat.fournisseurId,
            achatId: achat.id,
            date: achat.date,
            montant: data.montantPaye,
            moyen: "especes",
            reference: achat.reference,
          }
          paiement = token ? await createPaiement(token, brouillon) : { ...brouillon, id: newId("pay") }
        }

        set({
          achats: [{ ...achat, montantPaye: data.montantPaye }, ...get().achats],
          paiements: paiement ? [paiement, ...get().paiements] : get().paiements,
        })
      },

      addPaiement: async (data) => {
        const token = useAuthStore.getState().token
        const paiement = token ? await createPaiement(token, data) : { ...data, id: newId("pay") }
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
      },
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
