import {
  LayoutDashboard, Sprout, Package, Wallet, Handshake, BarChart3,
  type LucideIcon,
} from "lucide-react"
import { useAuthStore } from "@/features/auth/authStore"
import type { UserRole } from "@/types/user"

export interface NavItem {
  to: string
  labelKey: string 
  icon: LucideIcon
  roles?: UserRole[]
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/app/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/app/production", labelKey: "nav.production", icon: Sprout, roles: ["admin", "ouvrier"] },
  { to: "/app/stocks", labelKey: "nav.stocks", icon: Package, roles: ["admin", "ouvrier"] },
  { to: "/app/finance", labelKey: "nav.finance", icon: Wallet, roles: ["admin", "comptable"] },
  { to: "/app/clients-fournisseurs", labelKey: "nav.clients", icon: Handshake, roles: ["admin", "comptable"] },
  { to: "/app/rapports", labelKey: "nav.reports", icon: BarChart3 },
]

export function useVisibleNavItems(): NavItem[] {
  const role = useAuthStore((s) => s.user?.role)
  return NAV_ITEMS.filter((item) => !item.roles || (role && item.roles.includes(role as UserRole)))
}