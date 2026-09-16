import { NavLink, Link } from "react-router"
import { useTranslation } from "react-i18next"
import { Menu, Leaf, ChevronDown } from "lucide-react"
import { useSidebarPreferenceStore } from "@/features/ui/sidebarPreferenceStore"
import { useGroupedNavItems } from "./navItems"
import { useNavBadges } from "./navBadges"

interface SidebarProps {
  onNavigate?: () => void
  forceExpanded?: boolean
}

function NavBadge({ count, muted }: { count: number; muted: boolean }) {
  return (
    <span
      className={`ml-auto inline-flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums transition-colors ${
        muted ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
      }`}
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}

export function Sidebar({ onNavigate, forceExpanded = false }: SidebarProps) {
  const { t } = useTranslation()
  const groupedItems = useGroupedNavItems()
  const badges = useNavBadges()

  const collapsed = useSidebarPreferenceStore((s) => s.collapsed) && !forceExpanded
  const toggle = useSidebarPreferenceStore((s) => s.toggle)
  const closedGroups = useSidebarPreferenceStore((s) => s.closedGroups)
  const toggleGroup = useSidebarPreferenceStore((s) => s.toggleGroup)

  function groupBadgeTotal(items: { to: string }[]) {
    return items.reduce((total, item) => total + (badges[item.to] ?? 0), 0)
  }

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
        {groupedItems.map(({ group, items }) => {
          const isOpen = collapsed || !closedGroups.includes(group)
          const hiddenTotal = isOpen ? 0 : groupBadgeTotal(items)

          return (
            <div key={group} className="mb-3 last:mb-0">
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 transition-transform duration-300 ${isOpen ? "" : "-rotate-90"}`}
                    strokeWidth={2}
                  />
                  <span className="truncate">{t(`nav.groups.${group}`)}</span>
                  {hiddenTotal > 0 && <NavBadge count={hiddenTotal} muted={false} />}
                </button>
              )}

              <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <ul className="flex flex-col gap-1 overflow-hidden">
                  {items.map(({ to, labelKey, icon: Icon }) => {
                    const count = badges[to] ?? 0
                    return (
                      <li key={to}>
                        <NavLink
                          to={to}
                          onClick={onNavigate}
                          title={collapsed ? t(labelKey) : undefined}
                          className={({ isActive }) =>
                            `relative flex items-center gap-2.5 rounded-md py-2.5 text-sm transition-colors duration-200 ${
                              collapsed ? "justify-center px-0" : "pl-5 pr-3"
                            } ${
                              isActive
                                ? "bg-primary font-medium text-primary-foreground shadow-sm"
                                : "text-foreground hover:bg-background"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {!collapsed && (
                                <span
                                  aria-hidden
                                  className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full transition-colors duration-200 ${
                                    isActive ? "bg-primary-foreground/80" : "bg-transparent"
                                  }`}
                                />
                              )}
                              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                              {!collapsed && <span className="animate-fade-in truncate">{t(labelKey)}</span>}
                              {!collapsed && count > 0 && <NavBadge count={count} muted={isActive} />}
                              {collapsed && count > 0 && (
                                <span
                                  aria-hidden
                                  className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-surface"
                                />
                              )}
                            </>
                          )}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </nav>
  )
}
