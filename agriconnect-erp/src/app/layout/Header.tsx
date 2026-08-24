import { useNavigate } from "react-router"
import { Sun, Moon, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/useTheme"
import { useAuthStore } from "@/features/auth/authStore"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Ouvrir le menu" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-serif text-lg text-primary sm:text-xl">AgriConnect</h1>
      </div>

      <div className="flex items-center gap-1">
        {user && <span className="mr-2 hidden text-sm text-muted-foreground sm:inline">{user.name}</span>}

        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={theme === "light" ? "Passer en mode sombre" : "Passer en mode clair"}>
          <span key={theme} className="inline-flex animate-fade-in">
            {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </span>
        </Button>

        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Se déconnecter">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}