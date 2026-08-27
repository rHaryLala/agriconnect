import { Navigate, Outlet } from "react-router"
import { useAuthStore } from "./authStore"
import { AuthSkeleton } from "@/components/shared/AuthSkeleton"
import type { UserRole } from "@/types/user"

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, hasHydrated } = useAuthStore()

  if (!hasHydrated) {
    return <AuthSkeleton />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <Outlet />
}