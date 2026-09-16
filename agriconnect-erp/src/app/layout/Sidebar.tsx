import { NavLink, Link, useLocation } from "react-router"
import { useTranslation } from "react-i18next"
import { Menu, Leaf, ChevronDown } from "lucide-react"
import { useSidebarPreferenceStore } from "@/features/ui/sidebarPreferenceStore"
import { useGroupedNavItems, type NavChild, type NavItem } from "./navItems"
import { useNavBadges, type BadgeKey } from "./navBadges"

interface SidebarProps {
  onNavigate?: () => void
  forceExpanded?: boolean
}

type BadgeTone = "alert" | "info"

function NavBadge({ count, tone }: { count: number; tone: BadgeTone }) {
  return (
    <span
      className={`ml-auto inline-flex h-5 min-w-[1.375rem] shrink-0 items-center justify-center rounded-md px-1.5 text-[11px] font-semibold tabular-nums ${
        tone === "alert" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"
      }`}
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}

function badgeToneFor(key: BadgeKey): BadgeTone {
  return key === "stockAlerts" ? "alert" : "info"
}

function samePath(target: string, pathname: string, search: string): boolean {
  const [targetPath, targetQuery = ""] = target.split("?")
  if (targetPath !== pathname) return false
  const currentTab = new URLSearchParams(search).get("tab") ?? ""
  const targetTab = new URLSearchParams(targetQuery).get("tab") ?? ""
  return currentTab === targetTab
}

export function Sidebar({ onNavigate, forceExpanded = false }: SidebarProps) {
  const { t } = useTranslation()
  const { pathname, search } = useLocation()
  const groupedItems = useGroupedNavItems()
  const badges = useNavBadges()

  const collapsed = useSidebarPreferenceStore((s) => s.collapsed) && !forceExpanded
  const toggle = useSidebarPreferenceStore((s) => s.toggle)
  const closedItems = useSidebarPreferenceStore((s) => s.closedItems)
  const toggleItem = useSidebarPreferenceStore((s) => s.toggleItem)

  function childBadge(child: NavChild) {
    return child.badgeKey ? badges[child.badgeKey as BadgeKey] ?? 0 : 0
  }

  function itemBadgeTotal(item: NavItem) {
    return (item.children ?? []).reduce((total, child) => total + childBadge(child), 0)
  }

  return (
    <nav className={`glass-surface flex h-full shrink-0 flex-col border-r border-border/60 transition-[width] duration-300 ease-in-out ${collapsed ? "w-16" : "w-60"}`}>
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

            <ul className="flex flex-col gap-0.5">
              {items.map((item) => {
                const Icon = item.icon
                const onSection = pathname.startsWith(item.to)
                const hasChildren = !!item.children?.length && !collapsed
                const isOpen = hasChildren && (!closedItems.includes(item.to) || onSection)
                const hiddenTotal = hasChildren && !isOpen ? itemBadgeTotal(item) : 0

                return (
                  <li key={item.to}>
                    <div className="flex items-center gap-1">
                      <NavLink
                        to={item.to}
                        onClick={onNavigate}
                        end={!hasChildren}
                        title={collapsed ? t(item.labelKey) : undefined}
                        className={({ isActive }) =>
                          `flex min-w-0 flex-1 items-center gap-2.5 rounded-lg py-2.5 text-sm transition-colors duration-200 ${
                            collapsed ? "justify-center px-0" : "px-3"
                          } ${
                            isActive && !hasChildren
                              ? "bg-primary font-medium text-primary-foreground shadow-sm"
                              : onSection
                                ? "font-medium text-foreground"
                                : "text-foreground hover:bg-background"
                          }`
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                        {!collapsed && <span className="animate-fade-in truncate">{t(item.labelKey)}</span>}
                        {hiddenTotal > 0 && <NavBadge count={hiddenTotal} tone="alert" />}
                      </NavLink>

                      {hasChildren && (
                        <button
                          type="button"
                          onClick={() => toggleItem(item.to)}
                          aria-expanded={isOpen}
                          aria-label={t(item.labelKey)}
                          className="flex h-8 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-background hover:text-foreground"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                            strokeWidth={2}
                          />
                        </button>
                      )}
                    </div>

                    {hasChildren && (
                      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                        <ul className="ml-[1.4rem] flex flex-col gap-0.5 overflow-hidden border-l border-border pl-2.5 pt-0.5">
                          {item.children?.map((child) => {
                            const count = childBadge(child)
                            const active = samePath(child.to, pathname, search)
                            return (
                              <li key={child.to}>
                                <Link
                                  to={child.to}
                                  onClick={onNavigate}
                                  aria-current={active ? "page" : undefined}
                                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
                                    active
                                      ? "bg-surface font-medium text-foreground shadow-sm ring-1 ring-border"
                                      : "text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  <span className="truncate">{t(child.labelKey)}</span>
                                  {count > 0 && <NavBadge count={count} tone={badgeToneFor(child.badgeKey as BadgeKey)} />}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}
