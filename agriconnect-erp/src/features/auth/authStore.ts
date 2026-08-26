import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types/user"
import { login as loginRequest } from "./api"

interface AuthState {
  user: User | null
  token: string | null
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
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { user, token } = await loginRequest(email, password)
          set({ user, token, isAuthenticated: true, isLoading: false })
        } catch (err) {
          set({ error: err instanceof Error ? err.message : "Erreur inconnue", isLoading: false })
          throw err
        }
      },

      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "agriconnect-auth",
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)