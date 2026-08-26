import { useEffect, useState } from "react"
import { Link } from "react-router"
import {
  Leaf, Sprout, Package, Wallet, Handshake, Receipt,
  Mail, Phone, MapPin, ArrowRight, BarChart3, WifiOff, Globe,
  Menu, X, ChevronDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCountUp } from "@/hooks/useCountUp"
import { useTilt3D } from "@/hooks/useTilt3D"
import { HeroSlideshow } from "./HeroSlideshow"
import { FeatureCard } from "./FeatureCard"

const FEATURES = [
  {
    icon: Sprout,
    title: "Production",
    description:
      "Pondeuses, Kuroiler, vaches laitières, maïs, riz, soja — une saisie par jour, un historique complet.",
  },
  {
    icon: Package,
    title: "Stock",
    description:
      "Entrées et sorties tracées automatiquement. Alerte dès qu'un article passe sous le seuil critique.",
  },
  {
    icon: Wallet,
    title: "Finance",
    description:
      "Dépenses et recettes catégorisées par activité. Le bénéfice se calcule tout seul.",
  },
  {
    icon: Handshake,
    title: "Clients & fournisseurs",
    description:
      "Historique des achats, soldes et dettes à jour à chaque paiement enregistré.",
  },
  {
    icon: Receipt,
    title: "Transactions",
    description:
      "Facturation, paiements partiels, crédits — un journal de caisse qui ne ment pas.",
  },
  {
    icon: BarChart3,
    title: "Rapports",
    description:
      "Financier, production, stock. Export PDF et Excel en un clic.",
  },
]

const STATS = [
  { target: 6, suffix: "", label: "Modules connectés", shortLabel: "Modules" },
  { target: 100, suffix: "%", label: "Fonctionne hors ligne", shortLabel: "Hors ligne" },
  { target: 3, suffix: "", label: "Langues (FR / MG / EN)", shortLabel: "Langues" },
]

function StatPill({ target, suffix, label, shortLabel }: { target: number; suffix: string; label: string; shortLabel: string }) {
  const value = useCountUp(target, 1100)
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl border border-white/15 bg-white/10 px-2 py-2.5 backdrop-blur-md sm:px-6 sm:py-3">
      <span className="font-serif text-xl text-white sm:text-3xl">
        {Math.round(value)}
        {suffix}
      </span>
      <span className="text-center text-[10px] uppercase leading-tight tracking-wide text-white/70 sm:hidden">{shortLabel}</span>
      <span className="hidden text-center text-xs uppercase tracking-wide text-white/70 sm:block">{label}</span>
    </div>
  )
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const heroTilt = useTilt3D<HTMLDivElement>(2.5)
  const ctaTilt = useTilt3D<HTMLDivElement>(3)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <header
        className={`sticky top-0 z-40 flex h-16 items-center justify-between px-4 backdrop-blur-md transition-all duration-300 sm:px-6 ${
          scrolled
            ? "border-b border-neutral-200/80 bg-white/85 shadow-sm"
            : "border-b border-transparent bg-white/40"
        }`}
      >
        <Link to="/" className="group flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F8A5F] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <Leaf className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <span className="font-semibold text-neutral-900">AgriConnect</span>
        </Link>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            to="/login"
            className="text-sm text-neutral-600 transition-all duration-200 hover:text-neutral-900"
          >
            Se connecter
          </Link>
          <Button asChild size="sm" className="gap-1.5 transition-all duration-300 hover:scale-105 active:scale-95">
            <Link to="/register">
              S'inscrire
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition-colors duration-200 hover:bg-neutral-100 sm:hidden"
          aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileMenuOpen}
        >
          <Menu className={`absolute h-5 w-5 transition-all duration-300 ${mobileMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`} />
          <X className={`absolute h-5 w-5 transition-all duration-300 ${mobileMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`} />
        </button>
      </header>

      <div
        className={`fixed inset-0 z-30 sm:hidden ${mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div
          onClick={() => setMobileMenuOpen(false)}
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`glass-light absolute inset-x-3 top-[4.25rem] rounded-2xl p-4 shadow-2xl transition-all duration-300 ease-out ${
            mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-2">
            {[
              { to: "/login", label: "Se connecter" },
              { to: "/register", label: "Créer un compte" },
            ].map((item, i) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                style={{ transitionDelay: mobileMenuOpen ? `${i * 60 + 60}ms` : "0ms" }}
                className={`rounded-xl px-4 py-3 text-center text-sm font-medium text-neutral-800 transition-all duration-300 hover:bg-white/70 ${
                  mobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                } ${i === 1 ? "bg-[#0F8A5F] text-white hover:bg-[#0F8A5F]/90" : "bg-white/50"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden px-4 py-16 sm:px-6 sm:py-20 md:py-28">
        <HeroSlideshow />

        <div aria-hidden className="pointer-events-none absolute -left-16 top-16 h-56 w-56 animate-float-slow rounded-full bg-[#8FE3B3]/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-10 bottom-24 h-64 w-64 animate-float rounded-full bg-white/10 blur-3xl" />

        <div
          ref={heroTilt.ref}
          onMouseMove={heroTilt.onMouseMove}
          onMouseEnter={heroTilt.onMouseEnter}
          onMouseLeave={heroTilt.onMouseLeave}
          style={heroTilt.style}
          className="relative z-10 mx-auto w-full max-w-3xl animate-content-in rounded-3xl p-6 text-center shadow-2xl will-change-transform sm:p-8 md:p-12"
        >
          {/* Fond plus transparent pour mieux voir l'image */}
          <div className="absolute inset-0 rounded-3xl bg-black/30 backdrop-blur-sm" />
          
          <div className="relative">
            <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/30 px-3 py-1 text-xs text-white/90 backdrop-blur-sm">
              <Leaf className="h-3 w-3" />
              Logiciel de Gestion de Ferme
            </span>

            <h1 className="text-shadow-sm font-serif text-3xl leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              Toute votre ferme,
              <br />
              <span className="text-[#8FE3B3]">une seule ligne à la fois</span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm text-white/90 sm:text-base">
              Élevage, cultures, stock, finances, clients et fournisseurs — centralisés
              dans un seul outil, du poulailler au bureau du comptable.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:mt-8 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="group gap-2 bg-white text-[#0B3B27] transition-all duration-300 hover:scale-[1.05] hover:bg-white/90 active:scale-95"
              >
                <Link to="/login">
                  Se connecter au tableau de bord
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:scale-[1.05] hover:bg-white/20 active:scale-95"
              >
                <Link to="/register">Créer un compte</Link>
              </Button>
            </div>

            <div className="mt-9 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-3">
              {STATS.map((s) => (
                <StatPill key={s.label} {...s} />
              ))}
            </div>
          </div>
        </div>

        <ChevronDown
          aria-hidden
          className="absolute bottom-3 left-1/2 hidden h-5 w-5 -translate-x-1/2 animate-bounce text-white/60 sm:block"
        />
      </section>

      <section className="bg-dot-grid relative bg-neutral-50 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <span className="mb-4 inline-block rounded-full bg-[#0F8A5F]/10 px-3 py-1 text-xs font-medium text-[#0F8A5F]">
            Features
          </span>

          <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
            Ce que le logiciel gère pour vous
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-600">
            Chaque module alimente les autres automatiquement : une vente enregistrée
            met à jour le stock, la finance, et le solde du client — sans ressaisie.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {FEATURES.map(({ icon, title, description }, i) => (
              <FeatureCard key={title} icon={icon} title={title} description={description} delayMs={i * 80} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20">
        <picture className="absolute inset-0">
          <source srcSet="/hero/hero-11.webp" type="image/webp" />
          <img 
            src="/hero/hero-11.jpg" 
            alt="" 
            aria-hidden 
            loading="lazy" 
            decoding="async" 
            className="h-full w-full object-cover" 
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B3B27]/70 via-[#0B3B27]/60 to-[#0F8A5F]/50" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="glass-light mb-4 inline-block rounded-full px-3 py-1 text-xs text-white">
            Pensé pour le terrain
          </span>

          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Le réseau coupe. Le travail continue.
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">
            Un employé au poulailler ou au champ saisit sa production même sans connexion.
            Dès que le réseau revient, tout se synchronise seul — rien à refaire, rien à perdre.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 text-left sm:mt-10 sm:grid-cols-2">
            <div className="glass group rounded-xl p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl sm:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20 transition-transform duration-300 group-hover:scale-110">
                <WifiOff className="h-5 w-5 text-orange-400" strokeWidth={1.75} />
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-orange-400">Mode</p>
              <p className="font-semibold text-white">Hors Ligne</p>
              <p className="mt-1.5 text-sm text-white/60">
                Saisie stockée localement, envoyée automatiquement à la reconnexion.
              </p>
            </div>

            <div className="glass group rounded-xl p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl sm:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20 transition-transform duration-300 group-hover:scale-110">
                <Globe className="h-5 w-5 text-orange-400" strokeWidth={1.75} />
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-orange-400">Multilingue</p>
              <p className="font-semibold text-white">EN - FR - MG</p>
              <p className="mt-1.5 text-sm text-white/60">
                Français, Malagasy et Anglais pour toute l'équipe, du champ au bureau.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0B3B27] px-4 py-16 text-center sm:px-6 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0F8A5F]/30 blur-3xl" />
        <div
          ref={ctaTilt.ref}
          onMouseMove={ctaTilt.onMouseMove}
          onMouseEnter={ctaTilt.onMouseEnter}
          onMouseLeave={ctaTilt.onMouseLeave}
          style={ctaTilt.style}
          className="glass relative z-10 mx-auto max-w-2xl rounded-2xl p-8 shadow-2xl will-change-transform sm:p-10"
        >
          <h2 className="font-serif text-2xl text-white sm:text-3xl">
            Prêt à moderniser la gestion de votre ferme ?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/70">
            Créez votre compte en quelques minutes — aucune carte bancaire requise.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2 bg-white text-[#0B3B27] transition-all duration-300 hover:scale-[1.05] hover:bg-white/90 active:scale-95">
              <Link to="/register">
                Créer un compte gratuitement
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-[#0B1220] px-4 py-12 text-white/70 sm:px-6 sm:py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F8A5F]">
                <Leaf className="h-3.5 w-3.5 text-white" strokeWidth={2} />
              </div>
              <span className="font-semibold text-white">AgriConnect</span>
            </div>
            <p className="text-sm">
              Toute votre ferme, une seule ligne à la fois. Élevage, cultures, stock,
              finances, clients et fournisseurs — centralisés dans un seul outil.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">Quick Links</p>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link to="/login" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-white">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-white">
                  Register
                </Link>
              </li>
              <li className="text-white/40">Documentation</li>
              <li className="text-white/40">Support</li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">Contact Info</p>
            <ul className="flex flex-col gap-2 text-sm">
              <li className="flex items-center gap-2 transition-colors duration-200 hover:text-white">
                <Mail className="h-4 w-4 shrink-0" />
                support@zurcher.edu.mg
              </li>
              <li className="flex items-center gap-2 transition-colors duration-200 hover:text-white">
                <Phone className="h-4 w-4 shrink-0" />
                +261 34 47 885 15
              </li>
              <li className="flex items-center gap-2 transition-colors duration-200 hover:text-white">
                <MapPin className="h-4 w-4 shrink-0" />
                Vohitsoa, Sambaina
              </li>
              <li className="flex items-center gap-2 transition-colors duration-200 hover:text-white">
                <Globe className="h-4 w-4 shrink-0" />
                agriconnect.zurcher.edu.mg
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-5xl border-t border-white/10 pt-6 text-center text-xs text-white/40 sm:mt-10">
          © 2026 AgriConnect. All rights reserved. Empowering sustainable agriculture.
        </div>
      </footer>
    </div>
  )
}