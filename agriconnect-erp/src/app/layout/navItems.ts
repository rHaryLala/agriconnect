import {
  LayoutDashboard, Sprout, Package, Wallet, Handshake, BarChart3, Settings,
  type LucideIcon,
} from "lucide-react"
import { useAuthStore } from "@/features/auth/authStore"
import type { UserRole } from "@/types/user"

export type NavGroup = "principal" | "finances" | "commerce" | "analyse"

export interface NavItem {
  to: string
  labelKey: string
  icon: LucideIcon
  group: NavGroup
  roles?: UserRole[]
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/app/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, group: "principal" },
  { to: "/app/production", labelKey: "nav.production", icon: Sprout, group: "principal", roles: ["admin", "ouvrier"] },
  { to: "/app/stocks", labelKey: "nav.stocks", icon: Package, group: "principal", roles: ["admin", "ouvrier"] },
  { to: "/app/finance", labelKey: "nav.finance", icon: Wallet, group: "finances", roles: ["admin", "comptable"] },
  { to: "/app/rapports", labelKey: "nav.reports", icon: BarChart3, group: "analyse" },
  { to: "/app/settings", labelKey: "nav.settings", icon: Settings, group: "analyse" },
  { to: "/app/clients", labelKey: "nav.clients", icon: Handshake, group: "commerce", roles: ["admin", "comptable"] },
]

const NAV_GROUPS: NavGroup[] = ["principal", "finances", "commerce", "analyse"]

export function useVisibleNavItems(): NavItem[] {
  const role = useAuthStore((s) => s.user?.role)
  return NAV_ITEMS.filter((item) => !item.roles || (role && item.roles.includes(role as UserRole)))
}

export function useGroupedNavItems(): { group: NavGroup; items: NavItem[] }[] {
  const items = useVisibleNavItems()
  return NAV_GROUPS.map((group) => ({ group, items: items.filter((i) => i.group === group) })).filter((g) => g.items.length > 0)
}