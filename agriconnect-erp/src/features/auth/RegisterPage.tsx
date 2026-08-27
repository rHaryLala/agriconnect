import { useMemo, useState, type FormEvent } from "react"
import { Link } from "react-router"
import { Leaf, Eye, EyeOff, Loader2, Sprout, Users, LineChart, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTilt3D } from "@/hooks/useTilt3D"

const HIGHLIGHTS = [
  { icon: Sprout, text: "Suivez chaque culture et chaque cheptel au quotidien" },
  { icon: Users, text: "Un espace partagé pour toute votre équipe" },
  { icon: LineChart, text: "Des rapports financiers générés en un clic" },
]

const STRENGTH_LABELS = ["Très faible", "Faible", "Moyen", "Fort", "Excellent"]
const STRENGTH_COLORS = ["bg-destructive", "bg-orange-400", "bg-amber-300", "bg-lime-400", "bg-[#8FE3B3]"]

function getStrength(pw: string) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const cardTilt = useTilt3D<HTMLDivElement>(3)

  const strength = useMemo(() => getStrength(password), [password])
  const mismatch = confirmPassword.length > 0 && confirmPassword !== password

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 900)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B3B27]">
      <picture className="absolute inset-0">
        <source srcSet="/hero/hero-11.webp" type="image/webp" />
        <img src="/hero/hero-11.jpg" alt="" aria-hidden fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
      </picture>
     <div className="absolute inset-0 bg-gradient-to-l from-[#0B3B27]/95 via-[#0B3B27]/60 to-[#0B3B27]/80" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_25%_50%,rgba(11,59,39,0.55),transparent_70%)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 animate-drift-slow rounded-full bg-[#8FE3B3]/20 blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row-reverse lg:items-center lg:justify-between lg:gap-12 lg:px-16 xl:px-24">
        <div className="flex flex-col gap-6 p-6 pt-8 text-white sm:p-8 lg:max-w-md lg:p-0">
          <Link to="/" className="group flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <Leaf className="h-4.5 w-4.5 text-white" strokeWidth={2} />
            </div>
            <span className="font-serif text-lg">AgriConnect</span>
          </Link>

          <div className="hidden lg:block">
            <h2 className="text-shadow-sm font-serif text-3xl leading-tight xl:text-4xl">Rejoignez les fermes qui gagnent du temps.</h2>
            <p className="mt-3 text-sm text-white/80">Un compte, toute votre exploitation : production, stock, finances et clients.</p>

            <ul className="mt-8 flex flex-col gap-3">
              {HIGHLIGHTS.map(({ icon: Icon, text }, i) => (
                <li key={text} style={{ animationDelay: `${i * 100 + 150}ms` }} className="glass flex animate-content-in items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-white/90">
                  <Icon className="h-4 w-4 shrink-0 text-[#8FE3B3]" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center px-4 pb-10 pt-4 sm:px-6 lg:flex-none lg:py-10">
          <div
            ref={cardTilt.ref}
            onMouseMove={cardTilt.onMouseMove}
            onMouseEnter={cardTilt.onMouseEnter}
            onMouseLeave={cardTilt.onMouseLeave}
            style={cardTilt.style}
            className="glass-strong relative z-10 w-full max-w-sm animate-card-in rounded-2xl p-7 text-white shadow-2xl transition-shadow duration-500 will-change-transform hover:shadow-black/20 sm:p-9"
          >
            <div className="mb-7 text-center lg:text-left">
              <p className="font-serif text-2xl">Créer un compte</p>
              <p className="mt-1 text-sm text-white/70">Quelques infos pour démarrer</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="mb-1.5 block text-xs font-medium text-white/90">Prénom</label>
                  <input id="firstName" required className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/40 hover:border-white/35 focus:border-white/60 focus:ring-2 focus:ring-white/20" placeholder="Asandratriniaina" />
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-1.5 block text-xs font-medium text-white/90">Nom</label>
                  <input id="lastName" required className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/40 hover:border-white/35 focus:border-white/60 focus:ring-2 focus:ring-white/20" placeholder="Lesoa" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-white/90">Email</label>
                <input id="email" type="email" required className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/40 hover:border-white/35 focus:border-white/60 focus:ring-2 focus:ring-white/20" placeholder="lesoa.asa@zurcher.edu.mg" />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-white/90">Mot de passe</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 pr-10 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/40 hover:border-white/35 focus:border-white/60 focus:ring-2 focus:ring-white/20"
                    placeholder="••••••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/60 transition-all duration-200 hover:scale-110 hover:text-white">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="mt-2 animate-in fade-in duration-300">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i < strength ? STRENGTH_COLORS[strength] : "bg-white/15"}`} />
                      ))}
                    </div>
                    <p className="mt-1 text-[11px] text-white/60">
                      Robustesse : <span className="font-medium text-white/90">{STRENGTH_LABELS[strength]}</span>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-medium text-white/90">Confirmer le mot de passe</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-invalid={mismatch}
                    className={`w-full rounded-lg border bg-white/10 px-3 py-2 pr-9 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/40 focus:ring-2 ${
                      mismatch ? "border-red-400/60 focus:border-red-400 focus:ring-red-400/20" : "border-white/20 hover:border-white/35 focus:border-white/60 focus:ring-white/20"
                    }`}
                    placeholder="••••••••••••"
                  />
                  {!mismatch && confirmPassword.length > 0 && <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-in zoom-in text-[#8FE3B3] duration-300" />}
                </div>
                {mismatch && <p className="mt-1 animate-in slide-in-from-top-1 text-xs text-red-300 duration-200">Les mots de passe ne correspondent pas.</p>}
              </div>

              <label className="flex min-h-[44px] select-none items-start gap-2 text-xs text-white/70">
                <input type="checkbox" required className="mt-0.5 h-3.5 w-3.5 rounded border-white/30 bg-white/10 text-[#0F8A5F] accent-[#0F8A5F] transition-transform duration-150 focus:ring-1 focus:ring-white/40" />
                J'accepte les conditions d'utilisation et la politique de confidentialité
              </label>

              <Button type="submit" disabled={loading} className="group mt-1 gap-2 bg-white text-[#0B3B27] transition-all duration-300 hover:scale-[1.02] hover:bg-white/90 active:scale-95">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />}
                {loading ? "Création..." : "Créer mon compte"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-white/60">
              Déjà un compte ?{" "}
              <Link to="/login" className="text-[#8FE3B3] transition-colors duration-200 hover:text-[#8FE3B3]/80 hover:underline">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}