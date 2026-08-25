import { useState, type FormEvent } from "react"
import { Link } from "react-router"
import { Leaf, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 900)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <img
        src="/hero/hero-07.jpg"
        alt=""
        aria-hidden
        loading="lazy"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 blur-[2px] transition-opacity duration-1000"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 animate-drift rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 animate-drift-slow rounded-full bg-accent/15 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-sm animate-card-in rounded-2xl border border-border bg-surface/95 p-9 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-primary/10">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/40 transition-transform duration-300 hover:scale-110">
            <Leaf className="h-6 w-6 text-white" strokeWidth={2} />
          </div>
          <p className="font-serif text-xl text-foreground">AgriConnect</p>
          <p className="mt-1 text-sm text-muted-foreground">Créer un compte</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="mb-1.5 block text-xs font-medium text-foreground">Prénom</label>
              <input
                id="firstName"
                className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
                placeholder="Asandratriniaina"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-1.5 block text-xs font-medium text-foreground">Nom</label>
              <input
                id="lastName"
                className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
                placeholder="Lesoa"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-foreground">Email</label>
            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
              placeholder="lesoa.asa@zurcher.edu.mg"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-foreground">Mot de passe</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 pr-10 text-sm text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-200 hover:text-foreground hover:scale-110"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="mt-2 gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-95"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Création..." : "Créer mon compte"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Déjà un compte ? <Link to="/login" className="text-primary transition-all duration-200 hover:underline hover:text-primary/80">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}