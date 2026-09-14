import type { ModuleKey, PermissionAction } from "@/lib/permissions"

export const MODULE_LABEL_KEYS: Record<ModuleKey, string> = {
  dashboard: "nav.dashboard",
  production: "nav.production",
  stock: "nav.stocks",
  finance: "nav.finance",
  clients: "nav.clients",
  personnel: "nav.personnel",
  settings: "nav.settings",
}

export const ACTION_LABEL_KEYS: Record<PermissionAction, string> = {
  read: "settings.roles.actionRead",
  create: "settings.roles.actionCreate",
  update: "settings.roles.actionUpdate",
  delete: "settings.roles.actionDelete",
}
