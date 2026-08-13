import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/useTheme"

function App() {
  const { theme, toggleTheme } = useTheme()
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-background text-foreground">
      <h1 className="font-serif text-4xl text-primary">AgriConnect</h1>
      <div className="flex gap-4">
        <Button>Primary</Button>
        <Button variant="outline">Outline</Button>
      </div>
      <p className="text-2xl font-bold tabular-nums text-success">
        1 245 000 Ar
      </p>

      <Button variant="ghost" onClick={toggleTheme}>
        Mode actuel : {theme === "light" ? "☀️ Clair" : "🌙 Sombre"} — cliquer pour changer
      </Button>
    </div>
  )
}

export default App