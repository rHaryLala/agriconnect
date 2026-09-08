import type { UserRole } from "@/types/user"

export type ModuleKey = "dashboard" | "production" | "stock" | "finance" | "clients" | "settings"
export type PermissionLevel = "full" | "readonly" | "none"

export const PERMISSIONS_MATRIX: Record<UserRole, Record<ModuleKey, PermissionLevel>> = {
  admin: { dashboard: "full", production: "full", stock: "full", finance: "full", clients: "full", settings: "full" },
  comptable: { dashboard: "full", production: "readonly", stock: "readonly", finance: "full", clients: "full", settings: "none" },
  ouvrier: { dashboard: "full", production: "full", stock: "full", finance: "none", clients: "none", settings: "none" },
  magasinier: { dashboard: "full", production: "full", stock: "full", finance: "none", clients: "full", settings: "none" },
  controleur_interne: { dashboard: "readonly", production: "readonly", stock: "readonly", finance: "readonly", clients: "readonly", settings: "readonly" },
}

export function getPermissionLevel(role: UserRole | undefined, module: ModuleKey): PermissionLevel {
  if (!role) return "none"
  return PERMISSIONS_MATRIX[role][module]
}