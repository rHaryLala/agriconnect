import { Navigate, Outlet } from "react-router"
import { useAuthStore } from "./authStore"
import { AuthSkeleton } from "@/components/shared/AuthSkeleton"
import { getPermissionLevel, type ModuleKey } from "@/lib/permissions"

interface ProtectedRouteProps {
  module?: ModuleKey
}

export function ProtectedRoute({ module }: ProtectedRouteProps) {
  const { isAuthenticated, user, hasHydrated } = useAuthStore()

  if (!hasHydrated) return <AuthSkeleton />
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />

  if (module && getPermissionLevel(user.role, module) === "none") {
    return <Navigate to="/app/dashboard" replace />
  }

  return <Outlet />
}