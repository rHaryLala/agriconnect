import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router"
import { Leaf, Eye, EyeOff, AlertCircle, Loader2, Mail, ShieldCheck, WifiOff, Globe2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "./authStore"
import { loginSchema, type LoginFormValues } from "./loginSchema"
import { useTilt3D } from "@/hooks/useTilt3D"

const HIGHLIGHTS = [
  { icon: ShieldCheck, text: "Données sécurisées, sauvegardes automatiques" },
  { icon: WifiOff, text: "Fonctionne même sans connexion internet" },
  { icon: Globe2, text: "Disponible en Français, Malagasy et Anglais" },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const cardTilt = useTilt3D<HTMLDivElement>(3)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema), defaultValues: { rememberMe: false } })

  async function onSubmit(values: LoginFormValues) {
    setServerError(null)
    try {
      await login(values.email, values.password, values.rememberMe)
      navigate("/app/dashboard")
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Erreur inconnue")
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B3B27]">
      <picture className="absolute inset-0">
        <source srcSet="/hero/hero-09.webp" type="image/webp" />
        <img src="/hero/hero-09.jpg" alt="" aria-hidden fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B3B27]/92 via-[#0B3B27]/78 to-[#0B3B27]/88" />
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 animate-drift rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 animate-drift-slow rounded-full bg-[#8FE3B3]/20 blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-16 xl:px-24">
        <div className="flex flex-col gap-6 p-6 pt-8 text-white sm:p-8 lg:max-w-md lg:p-0">
          <Link to="/" className="group flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <Leaf className="h-4.5 w-4.5 text-white" strokeWidth={2} />
            </div>
            <span className="font-serif text-lg">AgriConnect</span>
          </Link>

          <div className="hidden lg:block">
            <h2 className="text-shadow-sm font-serif text-3xl leading-tight xl:text-4xl">Votre ferme, pilotée depuis un seul écran.</h2>
            <p className="mt-3 text-sm text-white/80">Production, stock, finances et clients — synchronisés, même sur le terrain.</p>

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
              <p className="font-serif text-2xl">Bon retour</p>
              <p className="mt-1 text-sm text-white/70">Connectez-vous à votre espace</p>
            </div>

            {serverError && (
              <div role="alert" className="mb-5 flex animate-in slide-in-from-top-2 items-start gap-2.5 rounded-lg border-l-2 border-destructive bg-destructive/20 px-3.5 py-2.5 duration-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                <div>
                  <p className="text-sm font-semibold text-red-200">Connexion refusée</p>
                  <p className="text-xs text-red-200/85">{serverError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-white/90">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className="w-full rounded-lg border border-white/20 bg-white/10 py-2 pl-9 pr-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/40 hover:border-white/35 focus:border-white/60 focus:ring-2 focus:ring-white/20"
                    placeholder="lesoa.asa@zurcher.edu.mg"
                  />
                </div>
                {errors.email && <p id="email-error" className="mt-1 animate-in slide-in-from-top-1 text-xs text-red-300 duration-200">{errors.email.message}</p>}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-medium text-white/90">Mot de passe</label>
                  <button type="button" tabIndex={-1} className="text-xs text-[#8FE3B3] transition-colors duration-200 hover:text-[#8FE3B3]/80 hover:underline">
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 pr-10 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/40 hover:border-white/35 focus:border-white/60 focus:ring-2 focus:ring-white/20"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/60 transition-all duration-200 hover:scale-110 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p id="password-error" className="mt-1 animate-in slide-in-from-top-1 text-xs text-red-300 duration-200">{errors.password.message}</p>}
              </div>

              <label className="flex min-h-[44px] select-none items-center gap-2 text-xs text-white/70">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="h-3.5 w-3.5 rounded border-white/30 bg-white/10 text-[#0F8A5F] accent-[#0F8A5F] transition-transform duration-150 focus:ring-1 focus:ring-white/40"
                />
                Se souvenir de moi
              </label>

              <Button type="submit" disabled={isSubmitting} className="group mt-1 gap-2 bg-white text-[#0B3B27] transition-all duration-300 hover:scale-[1.02] hover:bg-white/90 active:scale-95">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />}
                {isSubmitting ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-white/60">
              Pas encore de compte ?{" "}
              <Link to="/register" className="text-[#8FE3B3] transition-colors duration-200 hover:text-[#8FE3B3]/80 hover:underline">Créer un compte</Link>
            </p>

            <div className="mt-5 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-center text-[11px] leading-relaxed text-white/60">
              Démo : lesoa.asa@zurcher.edu.mg / rasamizafy.sit@zurcher.edu.mg / radoniaina.v@zurcher.edu.mg
              <br />
              mot de passe : <span className="font-medium text-white/90">1234qwerty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}