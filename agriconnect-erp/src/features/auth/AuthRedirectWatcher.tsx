import { useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { useAuthStore, LOGOUT_REASON_FLAG } from "./authStore"

export function AuthRedirectWatcher() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logoutReason = useAuthStore((s) => s.logoutReason)
  const clearLogoutReason = useAuthStore((s) => s.clearLogoutReason)
  const navigate = useNavigate()
  const wasAuthenticated = useRef(isAuthenticated)

  // logout() force un rechargement complet de la page (voir authStore) : l'état React
  // "logoutReason" ne survit pas à la navigation, d'où ce relais par sessionStorage
  // pour afficher le toast d'expiration après le rechargement.
  useEffect(() => {
    if (sessionStorage.getItem(LOGOUT_REASON_FLAG) === "expired") {
      sessionStorage.removeItem(LOGOUT_REASON_FLAG)
      toast.error("Ta session a expiré", { description: "Reconnecte-toi pour continuer." })
    }
  }, [])

  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      if (logoutReason === "expired") {
        toast.error("Ta session a expiré", { description: "Reconnecte-toi pour continuer." })
      }
      navigate("/", { replace: true })
      clearLogoutReason()
    }
    wasAuthenticated.current = isAuthenticated
  }, [isAuthenticated, logoutReason, navigate, clearLogoutReason])

  return null
}