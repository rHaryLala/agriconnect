import { create } from "zustand"
import { fetchDashboard, type DashboardData } from "./dashboardApi"
import { MOCK_DASHBOARD_DATA } from "./mockDashboardData"
import { useAuthStore } from "@/features/auth/authStore"

interface DashboardState {
  data: DashboardData
  isLoading: boolean
  hasFetched: boolean
  fetchAll: () => Promise<void>
}

// Initialise avec les valeurs de demonstration : l'affichage reste identique
// tant que le serveur n'a pas repondu, et ne clignote pas.
const INITIAL: DashboardData = { ...MOCK_DASHBOARD_DATA, stockCritique: [], champsReels: [] }

export const useDashboardStore = create<DashboardState>((set, get) => ({
  data: INITIAL,
  isLoading: false,
  hasFetched: false,

  fetchAll: async () => {
    if (get().hasFetched) return
    const token = useAuthStore.getState().token
    if (!token) return
    set({ isLoading: true })
    try {
      set({ data: await fetchDashboard(token), hasFetched: true })
    } finally {
      set({ isLoading: false })
    }
  },
}))
