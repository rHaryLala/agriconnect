import { create } from "zustand"
import type { StockArticle, StockMovement } from "@/types/stock"
import { SEED_ARTICLES, SEED_MOVEMENTS } from "./mockStockData"

const FAKE_LATENCY_MS = 500

interface StockState {
  articles: StockArticle[]
  movements: StockMovement[]
  isLoading: boolean
  fetchAll: () => Promise<void>
  addArticle: (data: Omit<StockArticle, "id">) => void
  addMovement: (data: Omit<StockMovement, "id">) => Promise<void>
  deleteMovement: (id: string) => void
}

export const useStockStore = create<StockState>((set, get) => ({
  articles: [],
  movements: [],
  isLoading: false,

  fetchAll: () =>
    new Promise((resolve) => {
      set({ isLoading: true })
      setTimeout(() => {
        set({ articles: SEED_ARTICLES, movements: SEED_MOVEMENTS, isLoading: false })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  addArticle: (data) => {
    const newArticle: StockArticle = { ...data, id: `article-${Date.now()}` }
    set({ articles: [...get().articles, newArticle] })
  },

  addMovement: (data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({ movements: [{ ...data, id: `mvt-${Date.now()}` }, ...get().movements] })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  deleteMovement: (id) => set({ movements: get().movements.filter((m) => m.id !== id) }),
}))