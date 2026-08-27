import { NavLink } from "react-router"
import { Settings, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useSidebarPreferenceStore } from "@/features/ui/sidebarPreferenceStore"
import { useVisibleNavItems } from "./navItems"

interface SidebarProps {
  onNavigate?: () => void
  forceExpanded?: boolean
}

export function Sidebar({ onNavigate, forceExpanded = false }: SidebarProps) {
  const visibleItems = useVisibleNavItems()
  const collapsed = useSidebarPreferenceStore((s) => s.collapsed) && !forceExpanded
  const toggle = useSidebarPreferenceStore((s) => s.toggle)

  return (
    <nav className={`glass-surface flex h-full shrink-0 flex-col justify-between border-r border-border/60 p-3 transition-[width] duration-300 ease-in-out ${collapsed ? "w-16" : "w-56"}`}>
      <ul className="flex flex-col gap-1">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 ${collapsed ? "justify-center" : ""} ${
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-background"
                }`
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
            `flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 ${collapsed ? "justify-center" : ""} ${
              isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-background hover:text-foreground"
            }`
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
            className={`flex min-h-[44px] items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-background hover:text-foreground ${collapsed ? "justify-center" : ""}`}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4 shrink-0" strokeWidth={1.75} /> : <ChevronsLeft className="h-4 w-4 shrink-0" strokeWidth={1.75} />}
            {!collapsed && <span className="animate-fade-in truncate">Réduire</span>}
          </button>
        )}
      </div>
    </nav>
  )
}