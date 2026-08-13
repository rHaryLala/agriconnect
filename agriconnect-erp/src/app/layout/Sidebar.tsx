import { NavLink } from "react-router"
import { LayoutDashboard, Sprout, Package, Wallet, Handshake, BarChart3, Settings, type LucideIcon, } from "lucide-react"

type NavItem = { to: string; label: string; icon: LucideIcon }

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/production", label: "Production", icon: Sprout },
  { to: "/stocks", label: "Stocks", icon: Package },
  { to: "/finance", label: "Finance", icon: Wallet },
  { to: "/clients-fournisseurs", label: "Clients & Fournisseurs", icon: Handshake },
  { to: "/rapports", label: "Rapports", icon: BarChart3 },
]

export function Sidebar() {
  return (
    <nav className="flex w-56 shrink-0 flex-col justify-between border-r border-border bg-surface p-4">
      <ul className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-background"
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
        className={({ isActive }) =>
          `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors duration-200 ${
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-background hover:text-foreground"
          }`
        }
      >
        <Settings className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        Paramètres
      </NavLink>
    </nav>
  )
}