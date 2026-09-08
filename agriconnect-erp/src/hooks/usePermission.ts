import { useAuthStore } from "@/features/auth/authStore"
import { getPermissionLevel, type ModuleKey } from "@/lib/permissions"

export function usePermission(module: ModuleKey) {
  const role = useAuthStore((s) => s.user?.role)
  const level = getPermissionLevel(role, module)
  return { level, canView: level !== "none", canEdit: level === "full" }
}