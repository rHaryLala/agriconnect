import { NavLink, Link } from "react-router"
import { useTranslation } from "react-i18next"
import { Menu, Leaf } from "lucide-react"
import { useSidebarPreferenceStore } from "@/features/ui/sidebarPreferenceStore"
import { useGroupedNavItems } from "./navItems"

interface SidebarProps {
  onNavigate?: () => void
  forceExpanded?: boolean
}

export function Sidebar({ onNavigate, forceExpanded = false }: SidebarProps) {
  const { t } = useTranslation()
  const groupedItems = useGroupedNavItems()
  const collapsed = useSidebarPreferenceStore((s) => s.collapsed) && !forceExpanded
  const toggle = useSidebarPreferenceStore((s) => s.toggle)

  return (
    <nav className={`glass-surface flex h-full shrink-0 flex-col border-r border-border/60 transition-[width] duration-300 ease-in-out ${collapsed ? "w-16" : "w-56"}`}>
      <div className={`flex flex-wrap items-center gap-2 border-b border-border/60 p-3 ${collapsed ? "flex-col" : "justify-between"}`}>
        <Link to="/app/dashboard" onClick={onNavigate} className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-4 w-4 text-primary-foreground" strokeWidth={2} />
          </div>
          {!collapsed && <span className="animate-fade-in truncate font-serif text-base text-primary">AgriConnect</span>}
        </Link>
        {!forceExpanded && (
          <button
            type="button"
            onClick={toggle}
            title={collapsed ? t("nav.expand") : t("nav.collapse")}
            aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-background hover:text-foreground"
          >
            <Menu className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {groupedItems.map(({ group, items }) => (
          <div key={group} className="mb-4 last:mb-0">
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t(`nav.groups.${group}`)}
              </p>
            )}
            <ul className="flex flex-col gap-1">
              {items.map(({ to, labelKey, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={onNavigate}
                    title={collapsed ? t(labelKey) : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 ${collapsed ? "justify-center" : ""} ${
                        isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-background"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    {!collapsed && <span className="animate-fade-in truncate">{t(labelKey)}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}