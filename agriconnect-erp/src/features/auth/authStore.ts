import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User } from "@/types/user"
import { login as loginRequest } from "./api"
import { dynamicAuthStorage, setRememberPreference } from "@/lib/authStorage"

export type LogoutReason = "manual" | "expired" | null

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  hasHydrated: boolean
  logoutReason: LogoutReason
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>
  logout: (reason?: LogoutReason) => void
  clearLogoutReason: () => void
  setHasHydrated: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasHydrated: false,
      logoutReason: null,

      login: async (email, password, rememberMe) => {
        set({ isLoading: true, error: null })
        try {
          const { user, token } = await loginRequest(email, password)
          setRememberPreference(rememberMe)
          set({ user, token, isAuthenticated: true, isLoading: false })
        } catch (err) {
          set({ error: err instanceof Error ? err.message : "Erreur inconnue", isLoading: false })
          throw err
        }
      },

      logout: (reason = "manual") => set({ user: null, token: null, isAuthenticated: false, logoutReason: reason }),

      clearLogoutReason: () => set({ logoutReason: null }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "agriconnect-auth",
      storage: createJSONStorage(() => dynamicAuthStorage),
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)