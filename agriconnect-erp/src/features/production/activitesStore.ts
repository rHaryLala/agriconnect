import { create } from "zustand"
import { persist } from "zustand/middleware"
import { newId } from "@/lib/id"
import { useAuthStore } from "@/features/auth/authStore"
import { createActivite, deleteActivite, fetchActivites, updateActivite } from "./laborApi"

export interface ActiviteProfile {
  id: string
  nom: string
}

/**
 * Liste de référence des travaux. Elle existe en base (LaborActivity, unique
 * par ferme) et les relevés de main-d'œuvre la référencent par identifiant :
 * les créations passent donc par le serveur, qui attribue l'identifiant.
 *
 * Les valeurs ci-dessous restent le repli hors ligne et l'amorçage d'une ferme
 * qui n'a encore rien saisi.
 */
const ACTIVITES_PAR_DEFAUT: ActiviteProfile[] = [
  { id: "activite-mihava", nom: "Mihava" },
  { id: "activite-mamboly-vary", nom: "Mamboly vary" },
  { id: "activite-mijinja", nom: "Mijinja" },
  { id: "activite-mitery-ronono", nom: "Mitery ronono sy mitaona vilona" },
  { id: "activite-manangona-atody", nom: "Manangona atody" },
  { id: "activite-maraichere", nom: "Mikarakara maraîchère" },
]

interface ActivitesState {
  types: ActiviteProfile[]
  fetchTypes: () => Promise<void>
  addType: (nom: string) => Promise<void>
  updateType: (id: string, nom: string) => Promise<void>
  removeType: (id: string) => Promise<void>
}

export const useActivitesStore = create<ActivitesState>()(
  persist(
    (set, get) => ({
      types: ACTIVITES_PAR_DEFAUT,

      fetchTypes: async () => {
        const token = useAuthStore.getState().token
        if (!token) return
        const distantes = await fetchActivites(token)
        // Une liste vide signifie une ferme qui n'a rien saisi : on garde les
        // valeurs par defaut plutot que de vider l'ecran.
        if (distantes.length > 0) set({ types: distantes.map((a) => ({ id: a.id, nom: a.name })) })
      },

      addType: async (nom) => {
        const trimmed = nom.trim()
        if (!trimmed || get().types.some((a) => a.nom === trimmed)) return
        const token = useAuthStore.getState().token
        const creee = token
          ? await createActivite(token, trimmed)
          : { id: newId("activite"), name: trimmed }
        set({ types: [...get().types, { id: creee.id, nom: creee.name }] })
      },

      updateType: async (id, nom) => {
        const token = useAuthStore.getState().token
        if (token) await updateActivite(token, id, nom)
        set({ types: get().types.map((a) => (a.id === id ? { ...a, nom } : a)) })
      },

      // Le serveur refuse la suppression si des releves referencent l'activite
      // (onDelete: Restrict) : on attend sa reponse avant de retirer la ligne.
      removeType: async (id) => {
        const token = useAuthStore.getState().token
        if (token) await deleteActivite(token, id)
        set({ types: get().types.filter((a) => a.id !== id) })
      },
    }),
    { name: "agriconnect-activites" }
  )
)
