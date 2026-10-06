import { Navigate, Outlet } from "react-router"
import { useAuthStore } from "./authStore"
import { AuthSkeleton } from "@/components/shared/AuthSkeleton"
import { levelFromPermissions, type ModuleKey } from "@/lib/permissions"
import { useEffectivePermissions } from "@/hooks/usePermission"

interface ProtectedRouteProps {
  module?: ModuleKey
}

export function ProtectedRoute({ module }: ProtectedRouteProps) {
  const { isAuthenticated, user, hasHydrated } = useAuthStore()
  const permissions = useEffectivePermissions()

  if (!hasHydrated) return <AuthSkeleton />
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />

  if (module && levelFromPermissions(permissions, module) === "none") {
    return <Navigate to="/app/dashboard" replace />
  }

  return <Outlet />
}