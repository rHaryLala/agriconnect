import { useNavigate } from "react-router"
import { Leaf, Sun, Moon, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/useTheme"
import { useAuthStore } from "@/features/auth/authStore"

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      {/* Logo + nom */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
          <Leaf
            className="h-5 w-5 text-white"
            strokeWidth={2}
          />
        </div>

        <h1 className="font-serif text-xl font-semibold text-primary">
          AgriConnect
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {user && (
          <span className="mr-2 hidden text-sm text-muted-foreground sm:block">
            {user.name}
          </span>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={
            theme === "light"
              ? "Passer en mode sombre"
              : "Passer en mode clair"
          }
        >
          <span
            key={theme}
            className="inline-flex animate-fade-in"
          >
            {theme === "light" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          aria-label="Se déconnecter"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}