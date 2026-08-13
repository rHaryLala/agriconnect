import { Leaf, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/useTheme"

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
          <Leaf
            className="h-5 w-5 text-white"
            strokeWidth={2}
          />
        </div>

        <h1 className="font-serif text-xl text-primary">
          AgriConnect
        </h1>
      </div>

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
    </header>
  )
}