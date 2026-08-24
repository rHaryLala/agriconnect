import { NavLink } from "react-router"
import {
  LayoutDashboard, Sprout, Package, Wallet, Handshake, BarChart3, Settings,
  type LucideIcon,
} from "lucide-react"
import { useAuthStore } from "@/features/auth/authStore"
import type { UserRole } from "@/types/user"

type NavItem = { to: string; label: string; icon: LucideIcon; roles?: UserRole[] }

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/production", label: "Production", icon: Sprout, roles: ["admin", "ouvrier"] },
  { to: "/stocks", label: "Stocks", icon: Package, roles: ["admin", "ouvrier"] },
  { to: "/finance", label: "Finance", icon: Wallet, roles: ["admin", "finance_commercial"] },
  { to: "/clients-fournisseurs", label: "Clients & Fournisseurs", icon: Handshake, roles: ["admin", "finance_commercial"] },
  { to: "/rapports", label: "Rapports", icon: BarChart3 },
]

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const role = useAuthStore((s) => s.user?.role)
  const visibleItems = navItems.filter((item) => !item.roles || (role && item.roles.includes(role)))

  return (
    <nav className="flex h-full w-56 shrink-0 flex-col justify-between border-r border-border bg-surface p-4">
      <ul className="flex flex-col gap-1">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors duration-200 ${
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-background"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      <NavLink
        to="/settings"
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors duration-200 ${
            isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-background hover:text-foreground"
          }`
        }
      >
        <Settings className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        Paramètres
      </NavLink>
    </nav>
  )
}