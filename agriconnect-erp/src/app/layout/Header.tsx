import { useTranslation } from "react-i18next"
import { Sun, Moon, LogOut, Menu } from "lucide-react"
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
    <header className="glass-surface sticky top-0 z-20 mx-2 mt-2 flex h-14 items-center justify-between rounded-2xl px-4 shadow-sm sm:mx-3 sm:mt-3 sm:h-16 sm:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label={t("nav.openMenu")} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-serif text-lg text-primary sm:text-xl">AgriConnect</h1>
      </div>

      <div className="flex items-center gap-1">
        {user && <span className="mr-2 hidden text-sm text-muted-foreground sm:inline">{user.name}</span>}

        <LanguageSwitcher compact />

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