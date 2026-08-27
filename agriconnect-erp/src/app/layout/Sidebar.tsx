import { NavLink } from "react-router"
import {
  LayoutDashboard, Sprout, Package, Wallet, Handshake, BarChart3, Settings,
  ChevronsLeft, ChevronsRight,
  type LucideIcon,
} from "lucide-react"
import { useAuthStore } from "@/features/auth/authStore"
import { useSidebarPreferenceStore } from "@/features/ui/sidebarPreferenceStore"
import type { UserRole } from "@/types/user"

type NavItem = { to: string; label: string; icon: LucideIcon; roles?: UserRole[] }

const navItems: NavItem[] = [
  { to: "/app/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/app/production", label: "Production", icon: Sprout, roles: ["admin", "ouvrier"] },
  { to: "/app/stocks", label: "Stocks", icon: Package, roles: ["admin", "ouvrier"] },
  { to: "/app/finance", label: "Finance", icon: Wallet, roles: ["admin", "comptable"] },
  { to: "/app/clients-fournisseurs", label: "Clients & Fournisseurs", icon: Handshake, roles: ["admin", "comptable"] },
  { to: "/app/rapports", label: "Rapports", icon: BarChart3 },
]

interface SidebarProps {
  onNavigate?: () => void
  forceExpanded?: boolean
}

export function Sidebar({ onNavigate, forceExpanded = false }: SidebarProps) {
  const role = useAuthStore((s) => s.user?.role)
  const collapsed = useSidebarPreferenceStore((s) => s.collapsed) && !forceExpanded
  const toggle = useSidebarPreferenceStore((s) => s.toggle)
  const visibleItems = navItems.filter((item) => !item.roles || (role && item.roles.includes(role as UserRole)))

  return (
    <nav
      className={`flex h-full shrink-0 flex-col justify-between border-r border-border bg-surface p-3 transition-[width] duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <ul className="flex flex-col gap-1">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 ${
                  collapsed ? "justify-center" : ""
                } ${isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-background"}`
              }
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {!collapsed && <span className="animate-fade-in truncate">{label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1">
        <NavLink
          to="/app/settings"
          onClick={onNavigate}
          title={collapsed ? "Paramètres" : undefined}
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 ${
              collapsed ? "justify-center" : ""
            } ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-background hover:text-foreground"}`
          }
        >
          <Settings className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          {!collapsed && <span className="animate-fade-in truncate">Paramètres</span>}
        </NavLink>
        {!forceExpanded && (
          <button
            type="button"
            onClick={toggle}
            title={collapsed ? "Déplier le menu" : "Réduire le menu"}
            aria-label={collapsed ? "Déplier le menu" : "Réduire le menu"}
            className={`flex min-h-[44px] items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-background hover:text-foreground ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4 shrink-0" strokeWidth={1.75} /> : <ChevronsLeft className="h-4 w-4 shrink-0" strokeWidth={1.75} />}
            {!collapsed && <span className="animate-fade-in truncate">Réduire</span>}
          </button>
        )}
      </div>
    </nav>
  )
}