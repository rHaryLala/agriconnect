import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types/user"
import { mockLogin } from "./api"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const user = await mockLogin(email, password)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Erreur inconnue",
            isLoading: false,
          })
          throw err
        }
      },

      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "agriconnect-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)