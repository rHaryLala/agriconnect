import { Navigate, Outlet } from "react-router"
import { useAuthStore } from "./authStore"
import { AuthSkeleton } from "@/components/shared/AuthSkeleton"
import { useUserPermissionsStore } from "@/features/settings/userPermissionsStore"
import { effectivePermissions, levelFromPermissions, type ModuleKey } from "@/lib/permissions"

interface ProtectedRouteProps {
  module?: ModuleKey
}

export function ProtectedRoute({ module }: ProtectedRouteProps) {
  const { isAuthenticated, user, hasHydrated } = useAuthStore()
  const overrides = useUserPermissionsStore((s) => s.overrides)

  if (!hasHydrated) return <AuthSkeleton />
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />

  if (module && levelFromPermissions(effectivePermissions(user.role, overrides[user.id]), module) === "none") {
    return <Navigate to="/app/dashboard" replace />
  }

  return <Outlet />
}