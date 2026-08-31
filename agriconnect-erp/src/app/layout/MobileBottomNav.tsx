import { NavLink } from "react-router"
import { useTranslation } from "react-i18next"
import { MoreHorizontal } from "lucide-react"
import { useVisibleNavItems } from "./navItems"

interface MobileBottomNavProps {
  onMenuClick: () => void
}

export function MobileBottomNav({ onMenuClick }: MobileBottomNavProps) {
  const { t } = useTranslation()
  const items = useVisibleNavItems().slice(0, 4)

  return (
    <nav className="fixed inset-x-3 bottom-3 z-30 lg:hidden">
      <div className="glass-surface flex items-center justify-around rounded-full px-2 py-2 shadow-xl">
        {items.map(({ to, labelKey, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={t(labelKey)}
            className={({ isActive }) =>
              `flex min-h-[44px] items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-all duration-300 ${
                isActive ? "-translate-y-1 min-w-[44px] bg-primary text-primary-foreground shadow-md" : "min-w-[44px] text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                {isActive && <span className="animate-fade-in truncate">{t(labelKey)}</span>}
              </>
            )}
          </NavLink>
        ))}

        <button
          type="button"
          onClick={onMenuClick}
          aria-label={t("nav.more")}
          title={t("nav.more")}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <MoreHorizontal className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>
    </nav>
  )
}