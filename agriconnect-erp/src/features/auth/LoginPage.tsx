import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router"
import { Leaf, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (loading) return
    setError(false)

    if (!email || !password) {
      setError(true)
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate("/dashboard")
    }, 900)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 animate-drift rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 animate-drift-slow rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-sm animate-card-in rounded-2xl border border-border bg-surface/90 p-9 shadow-xl backdrop-blur-xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <Leaf className="h-6 w-6 text-white" strokeWidth={2} />
          </div>
          <p className="font-serif text-xl text-foreground">AgriConnect</p>
          <p className="mt-1 text-sm text-muted-foreground">Connectez-vous à votre espace</p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 rounded-lg border-l-2 border-destructive bg-destructive/10 px-3.5 py-2.5"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-destructive">Champs manquants</p>
              <p className="text-xs text-destructive/85">Renseigne ton email et ton mot de passe.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={error && !email}
              aria-describedby={error && !email ? "email-error" : undefined}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="lesoa.asa@zurcher.edu.mg"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-foreground">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={error && !password}
                aria-describedby={error && !password ? "password-error" : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="mt-2 gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
      </div>
    </div>
  )
}