import { useEffect, useState } from "react"
import { Link } from "react-router"
import {
  Leaf, Sprout, Package, Wallet, Handshake, Receipt,
  Mail, Phone, MapPin, ArrowRight, BarChart3, WifiOff, Globe,
  Menu, X
} from "lucide-react"

import { Button } from "@/components/ui/button"
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

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }

    window.addEventListener("scroll", onScroll, {
      passive: true,
    })

    onScroll()

    return () => {
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <header
        className={`sticky top-0 z-40 flex h-16 items-center justify-between border-b px-4 sm:px-6 backdrop-blur-md transition-all duration-300 ${
          scrolled ? "border-neutral-200 bg-white/90 shadow-sm" : "border-transparent bg-white/50"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F8A5F] transition-transform duration-300 hover:scale-110">
            <Leaf className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <span className="font-semibold text-neutral-900">AgriConnect</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-3">
          <Link 
            to="/login" 
            className="text-sm text-neutral-600 transition-all duration-200 hover:text-neutral-900 hover:scale-105"
          >
            Se connecter
          </Link>
          <Button asChild size="sm" className="transition-all duration-300 hover:scale-105 active:scale-95">
            <Link to="/register">S'inscrire</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden flex items-center justify-center p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors duration-200"
          aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="fixed top-16 left-0 right-0 bg-white border-b border-neutral-200 shadow-lg p-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                className="w-full px-4 py-2.5 text-center text-sm text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Se connecter
              </Link>
              <Button 
                asChild 
                className="w-full transition-all duration-300 hover:scale-[1.02] active:scale-95"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/register">S'inscrire</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <section className="relative overflow-hidden px-4 sm:px-6 py-16 sm:py-20 md:py-28">
        <HeroSlideshow />

        <div className="relative z-10 mx-auto max-w-3xl animate-content-in rounded-3xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-md shadow-2xl sm:p-8 md:p-12">
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs text-white/90 backdrop-blur-sm">
            <Leaf className="h-3 w-3" />
            Logiciel de Gestion de Ferme
          </span>

          <h1 className="font-serif text-2xl leading-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
            Toute votre ferme,
            <br />
            <span className="text-[#8FE3B3]">
              une seule ligne à la fois
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-xs text-white/80 sm:text-sm md:text-base">
            Élevage, cultures, stock, finances, clients et fournisseurs
            — centralisés dans un seul outil, du poulailler au bureau du
            comptable.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-white text-[#0B3B27] transition-all duration-300 hover:scale-[1.05] hover:bg-white/90 active:scale-95"
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
              <Link to="/register">
                Créer un compte
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <span className="mb-4 inline-block rounded-full bg-[#0F8A5F]/10 px-3 py-1 text-xs font-medium text-[#0F8A5F]">
            Features
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">
            Ce que le logiciel gère pour vous
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-600">
            Chaque module alimente les autres automatiquement : une vente
            enregistrée met à jour le stock, la finance, et le solde du client
            — sans ressaisie.
          </p>

          <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {FEATURES.map(
              ({ icon, title, description }, i) => (
                <FeatureCard
                  key={title}
                  icon={icon}
                  title={title}
                  description={description}
                  delayMs={i * 80}
                />
              ),
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#0B3B27] px-4 sm:px-6 py-16 sm:py-20 text-center">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <span className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-white/90">
            Pensé pour le terrain
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Le réseau coupe. Le travail continue.
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">
            Un employé au poulailler ou au champ saisit sa production même
            sans connexion. Dès que le réseau revient, tout se synchronise
            seul — rien à refaire, rien à perdre.
          </p>

          <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                <WifiOff
                  className="h-5 w-5 text-orange-400"
                  strokeWidth={1.75}
                />
              </div>

              <p className="text-xs font-medium uppercase tracking-wide text-orange-400">
                Mode
              </p>

              <p className="font-semibold text-white">
                Hors Ligne
              </p>

              <p className="mt-1.5 text-sm text-white/60">
                Saisie stockée localement, envoyée automatiquement à la
                reconnexion.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                <Globe
                  className="h-5 w-5 text-orange-400"
                  strokeWidth={1.75}
                />
              </div>

              <p className="text-xs font-medium uppercase tracking-wide text-orange-400">
                Multilingue
              </p>

              <p className="font-semibold text-white">
                EN - FR - MG
              </p>

              <p className="mt-1.5 text-sm text-white/60">
                Français, Malagasy et Anglais pour toute l'équipe, du
                champ au bureau.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#0B1220] px-4 sm:px-6 py-12 sm:py-14 text-white/70">
        <div className="mx-auto grid max-w-5xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F8A5F]">
                <Leaf
                  className="h-3.5 w-3.5 text-white"
                  strokeWidth={2}
                />
              </div>

              <span className="font-semibold text-white">
                AgriConnect
              </span>
            </div>

            <p className="text-sm">
              Toute votre ferme, une seule ligne à la fois. Élevage,
              cultures, stock, finances, clients et fournisseurs —
              centralisés dans un seul outil.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">
              Quick Links
            </p>

            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link
                  to="/login"
                  className="transition-all duration-200 hover:text-white hover:translate-x-1 inline-block"
                >
                  Login
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="transition-all duration-200 hover:text-white hover:translate-x-1 inline-block"
                >
                  Register
                </Link>
              </li>

              <li className="text-white/40">
                Documentation
              </li>

              <li className="text-white/40">
                Support
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">
              Contact Info
            </p>

            <ul className="flex flex-col gap-2 text-sm">
              <li className="flex items-center gap-2 transition-all duration-200 hover:text-white">
                <Mail className="h-4 w-4 shrink-0" />
                support@zurcher.edu.mg
              </li>

              <li className="flex items-center gap-2 transition-all duration-200 hover:text-white">
                <Phone className="h-4 w-4 shrink-0" />
                +261 34 47 885 15
              </li>

              <li className="flex items-center gap-2 transition-all duration-200 hover:text-white">
                <MapPin className="h-4 w-4 shrink-0" />
                Vohitsoa, Sambaina
              </li>

              <li className="flex items-center gap-2 transition-all duration-200 hover:text-white">
                <Globe className="h-4 w-4 shrink-0" />
                agriconnect.zurcher.edu.mg
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-8 sm:mt-10 max-w-5xl border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © 2026 AgriConnect. All rights reserved. Empowering sustainable
          agriculture.
        </div>
      </footer>
    </div>
  )
}