import type { UserRole } from "@/types/user"

export type ModuleKey = "dashboard" | "production" | "stock" | "finance" | "clients" | "fournisseurs" | "personnel" | "settings"

export const MODULE_KEYS: ModuleKey[] = ["dashboard", "production", "stock", "finance", "clients", "fournisseurs", "personnel", "settings"]

export type PermissionAction = "read" | "create" | "update" | "delete"

export const PERMISSION_ACTIONS: PermissionAction[] = ["read", "create", "update", "delete"]

export type Permission = `${ModuleKey}:${PermissionAction}`

export function permission(module: ModuleKey, action: PermissionAction): Permission {
  return `${module}:${action}`
}

function fullAccess(module: ModuleKey): Permission[] {
  return PERMISSION_ACTIONS.map((action) => permission(module, action))
}

function readOnly(module: ModuleKey): Permission[] {
  return [permission(module, "read")]
}

export const ROLE_PRESETS: Record<UserRole, Permission[]> = {
  admin: MODULE_KEYS.flatMap(fullAccess),
  comptable: [
    ...fullAccess("dashboard"),
    ...readOnly("production"),
    ...readOnly("stock"),
    ...fullAccess("finance"),
    ...fullAccess("clients"),
    ...fullAccess("fournisseurs"),
    ...fullAccess("personnel"),
  ],
  ouvrier: [...fullAccess("dashboard"), ...fullAccess("production"), ...fullAccess("stock")],
  magasinier: [
    ...fullAccess("dashboard"),
    ...fullAccess("production"),
    ...fullAccess("stock"),
    ...fullAccess("clients"),
  ],
  controleur_interne: MODULE_KEYS.flatMap(readOnly),
}

export function permissionsForRole(role: UserRole | undefined): Permission[] {
  return role ? ROLE_PRESETS[role] : []
}

export function effectivePermissions(role: UserRole | undefined, override?: Permission[]): Permission[] {
  return override ?? permissionsForRole(role)
}

export function hasPermission(permissions: Permission[], module: ModuleKey, action: PermissionAction): boolean {
  return permissions.includes(permission(module, action))
}

export type PermissionLevel = "full" | "readonly" | "none"

export function levelFromPermissions(permissions: Permission[], module: ModuleKey): PermissionLevel {
  const canWrite = PERMISSION_ACTIONS.filter((a) => a !== "read").some((action) => hasPermission(permissions, module, action))
  if (canWrite) return "full"
  return hasPermission(permissions, module, "read") ? "readonly" : "none"
}

