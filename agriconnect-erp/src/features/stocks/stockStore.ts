import { create } from "zustand"
import type { StockArticle, StockMovement } from "@/types/stock"
import { SEED_ARTICLES, SEED_MOVEMENTS } from "./mockStockData"

const FAKE_LATENCY_MS = 500

interface StockState {
  articles: StockArticle[]
  movements: StockMovement[]
  isLoading: boolean
  hasFetched: boolean
  fetchAll: () => Promise<void>
  addArticle: (data: Omit<StockArticle, "id">) => void
  addMovement: (data: Omit<StockMovement, "id">) => Promise<void>
  updateMovement: (id: string, data: Omit<StockMovement, "id">) => Promise<void>
  deleteMovement: (id: string) => void
}

export const useStockStore = create<StockState>((set, get) => ({
  articles: [],
  movements: [],
  isLoading: false,
  hasFetched: false,

  fetchAll: () => {
    if (get().hasFetched) return Promise.resolve()
    return new Promise((resolve) => {
      set({ isLoading: true })
      setTimeout(() => {
        set({ articles: SEED_ARTICLES, movements: SEED_MOVEMENTS, isLoading: false, hasFetched: true })
        resolve()
      }, FAKE_LATENCY_MS)
    })
  },

  addArticle: (data) => {
    set({ articles: [...get().articles, { ...data, id: `article-${Date.now()}` }] })
  },

  addMovement: (data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({ movements: [{ ...data, id: `mvt-${Date.now()}` }, ...get().movements] })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  updateMovement: (id, data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({ movements: get().movements.map((m) => (m.id === id ? { ...data, id } : m)) })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  deleteMovement: (id) => set({ movements: get().movements.filter((m) => m.id !== id) }),
}))