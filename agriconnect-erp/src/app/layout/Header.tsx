import { useTranslation } from "react-i18next"
import { Sun, Moon, LogOut, Menu, Download, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/useTheme"
import { useAuthStore } from "@/features/auth/authStore"
import { useInstallPrompt } from "@/hooks/useInstallPrompt"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const user = useAuthStore((s) => s.user)
  const { isInstallable, promptInstall } = useInstallPrompt()
  const isOnline = useOnlineStatus()

  function handleLogout() {
    useAuthStore.getState().logout("manual")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="glass-surface sticky top-0 z-20 mx-2 mt-2 flex h-12 items-center gap-2 rounded-2xl px-3 shadow-sm sm:mx-3 sm:mt-3 sm:h-14 sm:px-4">
      <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label={t("nav.openMenu")} className="lg:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      {user && (
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {user.avatarInitials || getInitials(user.name)}
          </div>
          <span className="hidden truncate text-sm font-medium text-foreground sm:inline">{user.name}</span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-1">
        <LanguageSwitcher compact />

        {isInstallable && (
          <Button variant="ghost" size="icon" onClick={promptInstall} aria-label={t("offline.installButton")} title={t("offline.installButton")}>
            <Download className="h-4 w-4" />
          </Button>
        )}

        <div
          role="status"
          title={isOnline ? t("offline.onlineTooltip") : t("offline.offlineTooltip")}
          aria-label={isOnline ? t("offline.onlineTooltip") : t("offline.offlineTooltip")}
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground"
        >
          <span key={isOnline ? "online" : "offline"} className="inline-flex animate-fade-in">
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          </span>
          <span
            aria-hidden
            className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-surface transition-colors duration-300 ${
              isOnline ? "bg-success" : "bg-destructive"
            }`}
          />
        </div>

        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={theme === "light" ? t("nav.darkMode") : t("nav.lightMode")}>
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