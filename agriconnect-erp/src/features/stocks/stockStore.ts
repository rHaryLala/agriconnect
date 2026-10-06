import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { DEFAULT_STOCK_LOCATION, type StockArticle, type StockMovement } from "@/types/stock"
import { SEED_ARTICLES, SEED_MOVEMENTS } from "./mockStockData"
import { newId } from "@/lib/id"
import { fetchStock, createArticle, createMovement } from "./stockApi"
import { useAuthStore } from "@/features/auth/authStore"

const FAKE_LATENCY_MS = 500

function mergeSeedArticles(persisted: StockArticle[]): StockArticle[] {
  const known = new Set(persisted.map((a) => a.id))
  return [...persisted, ...SEED_ARTICLES.filter((a) => !known.has(a.id))]
}

interface StockState {
  articles: StockArticle[]
  movements: StockMovement[]
  isLoading: boolean
  hasFetched: boolean
  fetchAll: () => Promise<void>
  addArticle: (data: Omit<StockArticle, "id">) => Promise<void>
  addMovement: (data: Omit<StockMovement, "id">) => Promise<void>
  updateMovement: (id: string, data: Omit<StockMovement, "id">) => Promise<void>
  deleteMovement: (id: string) => void
}

export const useStockStore = create<StockState>()(
  persist(
    (set, get) => ({
      articles: [],
      movements: [],
      isLoading: false,
      hasFetched: false,

      fetchAll: async () => {
        if (get().hasFetched) return
        set({ isLoading: true })
        try {
          const token = useAuthStore.getState().token
          const { articles, movements } = token
            ? await fetchStock(token)
            : { articles: SEED_ARTICLES, movements: SEED_MOVEMENTS }
          set({ articles, movements, hasFetched: true })
        } finally {
          set({ isLoading: false })
        }
      },

      addArticle: async (data) => {
        const token = useAuthStore.getState().token
        const article = token ? await createArticle(token, data) : { ...data, id: newId("article") }
        set({ articles: [...get().articles, article] })
      },

      addMovement: async (data) => {
        const token = useAuthStore.getState().token
        const movement = token ? await createMovement(token, data) : { ...data, id: newId("mvt") }
        set({ movements: [movement, ...get().movements] })
      },

      // Pas d'appel reseau : le backend ne permet pas de modifier un mouvement,
      // il le corrige par une ecriture inverse (RG-06). La modification reste
      // donc locale jusqu'a ce que l'ecran passe par la route de correction.
      updateMovement: (id, data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            set({ movements: get().movements.map((m) => (m.id === id ? { ...data, id } : m)) })
            resolve()
          }, FAKE_LATENCY_MS)
        }),

      deleteMovement: (id) => set({ movements: get().movements.filter((m) => m.id !== id) }),
    }),
    {
      name: "agriconnect-stock",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persisted, version) => {
        let state = persisted as StockState
        if (version < 1 && state.hasFetched) {
          state = { ...state, articles: mergeSeedArticles(state.articles ?? []) }
        }
        if (version < 2) {
          state = {
            ...state,
            movements: (state.movements ?? []).map((m) => ({ ...m, emplacement: m.emplacement ?? DEFAULT_STOCK_LOCATION })),
          }
        }
        return state
      },
      partialize: (state) => ({
        articles: state.articles,
        movements: state.movements,
        hasFetched: state.hasFetched,
      }),
    }
  )
)
