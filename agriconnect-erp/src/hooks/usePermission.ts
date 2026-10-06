import { useAuthStore } from "@/features/auth/authStore"
import { useUserPermissionsStore } from "@/features/settings/userPermissionsStore"
import {
  effectivePermissions,
  hasPermission,
  levelFromPermissions,
  type ModuleKey,
  type PermissionAction,
} from "@/lib/permissions"

export function useEffectivePermissions() {
  const user = useAuthStore((s) => s.user)
  const serverPermissions = useAuthStore((s) => s.serverPermissions)
  const override = useUserPermissionsStore((s) => (user ? s.overrides[user.id] : undefined))
  // Les droits du serveur priment : c'est lui qui autorise reellement. La
  // matrice locale ne sert que de repli hors ligne.
  if (serverPermissions) return serverPermissions
  return effectivePermissions(user?.role, override)
}

export function usePermission(module: ModuleKey) {
  const permissions = useEffectivePermissions()
  const level = levelFromPermissions(permissions, module)
  return {
    level,
    canView: level !== "none",
    canEdit: level === "full",
    can: (action: PermissionAction) => hasPermission(permissions, module, action),
  }
}
