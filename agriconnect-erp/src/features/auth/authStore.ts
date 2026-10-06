import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User } from "@/types/user"
import type { Permission } from "@/lib/permissions"
import { login as loginRequest, fetchMe } from "./api"
import { dynamicAuthStorage, setRememberPreference } from "@/lib/authStorage"
import { clearSessionScopedStorage } from "@/lib/persistedStores"

export const LOGOUT_REASON_FLAG = "agriconnect-logout-reason"

export type LogoutReason = "manual" | "expired" | null

interface AuthState {
  user: User | null
  token: string | null
  /** Droits renvoyes par le serveur ; null tant qu'il n'a pas repondu. */
  serverPermissions: Permission[] | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  hasHydrated: boolean
  logoutReason: LogoutReason
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>
  logout: (reason?: LogoutReason) => void
  clearLogoutReason: () => void
  setHasHydrated: (value: boolean) => void
  updateUser: (user: User) => void
  refreshProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      serverPermissions: null,
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

      logout: (reason = "manual") => {
        clearSessionScopedStorage()
        set({ user: null, token: null, serverPermissions: null, isAuthenticated: false, logoutReason: reason })
        // Une navigation React seule laisserait les stores métier déjà chargés en mémoire :
        // la personne suivante sur ce poste les verrait encore le temps de la session JS.
        // Un rechargement complet force chaque store à se réhydrater depuis un
        // localStorage désormais vidé.
        if (reason === "expired") sessionStorage.setItem(LOGOUT_REASON_FLAG, "expired")
        window.location.assign("/")
      },

      clearLogoutReason: () => set({ logoutReason: null }),

      setHasHydrated: (value) => set({ hasHydrated: value }),

      updateUser: (user) => set({ user }),

      // Le role recu au login est fige a cet instant : un changement de role
      // n'y apparait jamais. On relit le profil au demarrage.
      refreshProfile: async () => {
        const { token } = useAuthStore.getState()
        if (!token) return
        const profil = await fetchMe(token)
        if (profil) set({ user: profil.user, serverPermissions: profil.permissions })
      },
    }),
    {
      name: "agriconnect-auth",
      storage: createJSONStorage(() => dynamicAuthStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        serverPermissions: state.serverPermissions,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)