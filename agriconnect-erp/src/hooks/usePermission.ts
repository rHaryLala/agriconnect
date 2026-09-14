import { useAuthStore } from "@/features/auth/authStore"
import {
  hasPermission,
  levelFromPermissions,
  permissionsForRole,
  type ModuleKey,
  type PermissionAction,
} from "@/lib/permissions"

export function usePermission(module: ModuleKey) {
  const role = useAuthStore((s) => s.user?.role)
  const permissions = permissionsForRole(role)
  const level = levelFromPermissions(permissions, module)
  return {
    level,
    canView: level !== "none",
    canEdit: level === "full",
    can: (action: PermissionAction) => hasPermission(permissions, module, action),
  }
}
