import { NavLink } from "react-router"
import { useTranslation } from "react-i18next"
import { Menu } from "lucide-react"
import { useVisibleNavItems } from "./navItems"

interface MobileBottomNavProps {
  onMenuClick: () => void
}

export function MobileBottomNav({ onMenuClick }: MobileBottomNavProps) {
  const { t } = useTranslation()
  const items = useVisibleNavItems().slice(0, 3)

  return (
    <nav className="glass-surface fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-full px-2 py-1.5 shadow-lg lg:hidden">
      {items.map(({ to, labelKey, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-full px-3 text-[10px] transition-colors duration-200 ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`
          }
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
          <span className="truncate">{t(labelKey)}</span>
        </NavLink>
      ))}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label={t("nav.openMenu")}
        className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-full px-3 text-[10px] text-muted-foreground transition-colors duration-200 hover:text-foreground"
      >
        <Menu className="h-5 w-5" strokeWidth={1.75} />
        <span>{t("nav.menu")}</span>
      </button>
    </nav>
  )
}