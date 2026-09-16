import {
  LayoutDashboard, Sprout, Package, Wallet, Handshake, BarChart3, Settings, IdCard, Truck,
  type LucideIcon,
} from "lucide-react"
import type { ModuleKey } from "@/lib/permissions"
import { useEffectivePermissions } from "@/hooks/usePermission"
import { levelFromPermissions } from "@/lib/permissions"

export type NavGroup = "principal" | "finances" | "commerce" | "analyse" | "systeme"
export const NAV_GROUPS: NavGroup[] = ["principal", "finances", "commerce", "analyse", "systeme"]

export interface NavChild {
  to: string
  labelKey: string
  badgeKey?: string
}

export interface NavItem {
  to: string
  labelKey: string
  icon: LucideIcon
  module?: ModuleKey
  group: NavGroup
  children?: NavChild[]
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/app/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, group: "principal" },
  {
    to: "/app/production",
    labelKey: "nav.production",
    icon: Sprout,
    module: "production",
    group: "principal",
    children: [
      { to: "/app/production", labelKey: "production.tabs.overview" },
      { to: "/app/production?tab=poules", labelKey: "production.tabs.poules" },
      { to: "/app/production?tab=vaches", labelKey: "production.tabs.vaches" },
      { to: "/app/production?tab=bovins", labelKey: "production.tabs.bovins" },
      { to: "/app/production?tab=agriculture", labelKey: "production.tabs.agriculture" },
    ],
  },
  {
    to: "/app/stocks",
    labelKey: "nav.stocks",
    icon: Package,
    module: "stock",
    group: "principal",
    children: [
      { to: "/app/stocks", labelKey: "stock.tabs.inventory" },
      { to: "/app/stocks?tab=mouvements", labelKey: "stock.tabs.movements" },
      { to: "/app/stocks?tab=transferts", labelKey: "stock.tabs.transfers" },
      { to: "/app/stocks?tab=alertes", labelKey: "stock.tabs.alerts", badgeKey: "stockAlerts" },
    ],
  },
  {
    to: "/app/finance",
    labelKey: "nav.finance",
    icon: Wallet,
    module: "finance",
    group: "finances",
    children: [
      { to: "/app/finance", labelKey: "finance.tabs.overview" },
      { to: "/app/finance?tab=transactions", labelKey: "finance.tabs.transactions" },
      { to: "/app/finance?tab=caisse", labelKey: "finance.tabs.cashbook" },
    ],
  },
  {
    to: "/app/clients",
    labelKey: "nav.clients",
    icon: Handshake,
    module: "clients",
    group: "commerce",
    children: [
      { to: "/app/clients", labelKey: "clients.tabs.clients" },
      { to: "/app/clients?tab=factures", labelKey: "clients.tabs.invoices", badgeKey: "unpaidInvoices" },
    ],
  },
  { to: "/app/fournisseurs", labelKey: "nav.fournisseurs", icon: Truck, module: "finance", group: "commerce" },
  {
    to: "/app/personnel",
    labelKey: "nav.personnel",
    icon: IdCard,
    module: "personnel",
    group: "commerce",
    children: [
      { to: "/app/personnel", labelKey: "personnel.tabsStaff" },
      { to: "/app/personnel?tab=retenues", labelKey: "personnel.tabsDeductions" },
    ],
  },
  { to: "/app/rapports", labelKey: "nav.reports", icon: BarChart3, group: "analyse" },
  { to: "/app/settings", labelKey: "nav.settings", icon: Settings, module: "settings", group: "systeme" },
]

export function useVisibleNavItems(): NavItem[] {
  const permissions = useEffectivePermissions()
  return NAV_ITEMS.filter((item) => !item.module || levelFromPermissions(permissions, item.module) !== "none")
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
