import { useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { useAuthStore } from "./authStore"

export function AuthRedirectWatcher() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logoutReason = useAuthStore((s) => s.logoutReason)
  const clearLogoutReason = useAuthStore((s) => s.clearLogoutReason)
  const navigate = useNavigate()
  const wasAuthenticated = useRef(isAuthenticated)

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