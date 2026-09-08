import {
  LayoutDashboard, Sprout, Package, Wallet, Handshake, BarChart3, Settings,
  type LucideIcon,
} from "lucide-react"
import type { ModuleKey } from "@/lib/permissions"
import { useAuthStore } from "@/features/auth/authStore"
import { getPermissionLevel } from "@/lib/permissions"

export type NavGroup = "principal" | "finances" | "commerce" | "analyse"
export const NAV_GROUPS: NavGroup[] = ["principal", "finances", "commerce", "analyse"]

export interface NavItem {
  to: string
  labelKey: string
  icon: LucideIcon
  module?: ModuleKey
  group: NavGroup
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/app/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, group: "principal" },
  { to: "/app/production", labelKey: "nav.production", icon: Sprout, module: "production", group: "principal" },
  { to: "/app/stocks", labelKey: "nav.stocks", icon: Package, module: "stock", group: "principal" },
  { to: "/app/finance", labelKey: "nav.finance", icon: Wallet, module: "finance", group: "finances" },
  { to: "/app/clients", labelKey: "nav.clients", icon: Handshake, module: "clients", group: "commerce" },
  { to: "/app/rapports", labelKey: "nav.reports", icon: BarChart3, group: "analyse" },
  { to: "/app/settings", labelKey: "nav.settings", icon: Settings, module: "settings", group: "principal" },
]

export function useVisibleNavItems(): NavItem[] {
  const role = useAuthStore((s) => s.user?.role)
  return NAV_ITEMS.filter((item) => !item.module || getPermissionLevel(role, item.module) !== "none")
}

export interface GroupedNavItems {
  group: NavGroup
  items: NavItem[]
}

export function useGroupedNavItems(): GroupedNavItems[] {
  const visibleItems = useVisibleNavItems()
  return NAV_GROUPS
    .map((group) => ({ group, items: visibleItems.filter((item) => item.group === group) }))
    .filter((entry) => entry.items.length > 0)
}