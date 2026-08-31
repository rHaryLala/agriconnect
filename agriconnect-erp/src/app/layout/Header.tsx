import { useTranslation } from "react-i18next"
import { Sun, Moon, LogOut, Menu, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/useTheme"
import { useAuthStore } from "@/features/auth/authStore"
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const user = useAuthStore((s) => s.user)

  function handleLogout() {
    useAuthStore.getState().logout("manual")
  }

  return (
    <header className="glass-surface sticky top-0 z-20 mx-2 mt-2 flex h-12 items-center gap-2 rounded-2xl px-3 shadow-sm sm:mx-3 sm:mt-3 sm:h-14 sm:px-4">
      <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label={t("nav.openMenu")} className="lg:hidden">
        <Menu className="h-5 w-5" />
      </Button>
      {user && (
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {user.avatarInitials}
          </div>
          <span className="hidden truncate text-sm font-medium text-foreground sm:inline">{user.name}</span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-1">
        <LanguageSwitcher compact />

        <Button variant="ghost" size="icon" disabled title={t("nav.offline")} aria-label={t("nav.offline")}>
          <WifiOff className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={theme === "light" ? "Dark mode" : "Light mode"}>
          <span key={theme} className="inline-flex animate-fade-in">
            {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </span>
        </Button>

        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label={t("nav.logout")}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}