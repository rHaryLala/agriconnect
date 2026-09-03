import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { EggCategory } from "@/types/production"

interface EggPricesState {
  prices: Record<EggCategory, number>
  setPrice: (category: EggCategory, price: number) => void
}

export const useEggPricesStore = create<EggPricesState>()(
  persist(
    (set, get) => ({
      prices: { gmNormal: 500, gmCasse: 250, pmNormal: 350, pmCasse: 150 },
      setPrice: (category, price) => set({ prices: { ...get().prices, [category]: price } }),
    }),
    { name: "agriconnect-egg-prices" }
  )
)