import {
  LayoutDashboard, Sprout, Package, Wallet, Handshake, BarChart3,
  type LucideIcon,
} from "lucide-react"
import { useAuthStore } from "@/features/auth/authStore"
import type { UserRole } from "@/types/user"

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  roles?: UserRole[]
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/app/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/app/production", label: "Production", icon: Sprout, roles: ["admin", "ouvrier"] },
  { to: "/app/stocks", label: "Stocks", icon: Package, roles: ["admin", "ouvrier"] },
  { to: "/app/finance", label: "Finance", icon: Wallet, roles: ["admin", "comptable"] },
  { to: "/app/clients-fournisseurs", label: "Clients & Fournisseurs", icon: Handshake, roles: ["admin", "comptable"] },
  { to: "/app/rapports", label: "Rapports", icon: BarChart3 },
]

export function useVisibleNavItems(): NavItem[] {
  const role = useAuthStore((s) => s.user?.role)
  return NAV_ITEMS.filter((item) => !item.roles || (role && item.roles.includes(role as UserRole)))
}