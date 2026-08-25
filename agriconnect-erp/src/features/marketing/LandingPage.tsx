import { Link } from "react-router"
import {
  Leaf, Sprout, Package, Wallet, Handshake, Receipt, BarChart3,
  WifiOff, Globe, Mail, Phone, MapPin, ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const FEATURES = [
  { icon: Sprout, title: "Production", description: "Pondeuses, Kuroiler, vaches laitières, maïs, riz, soja — une saisie par jour, un historique complet." },
  { icon: Package, title: "Stock", description: "Entrées et sorties tracées automatiquement. Alerte dès qu'un article passe sous le seuil critique." },
  { icon: Wallet, title: "Finance", description: "Dépenses et recettes catégorisées par activité. Le bénéfice se calcule tout seul." },
  { icon: Handshake, title: "Clients & fournisseurs", description: "Historique des achats, soldes et dettes à jour à chaque paiement enregistré." },
  { icon: Receipt, title: "Transactions", description: "Facturation, paiements partiels, crédits — un journal de caisse qui ne ment pas." },
  { icon: BarChart3, title: "Rapports", description: "Financier, production, stock. Export PDF et Excel en un clic." },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header public */}
      <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F8A5F]">
            <Leaf className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <span className="font-semibold text-neutral-900">AgriConnect</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-neutral-600 transition-colors hover:text-neutral-900">
            Se connecter
          </Link>
          <Button asChild size="sm">
            <Link to="/register">S'inscrire</Link>
          </Button>
        </div>
      </header>
      <section className="relative overflow-hidden bg-[#0B3B27] px-6 py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px, 64px 64px",
          }}
        />
        <div className="relative mx-auto max-w-3xl animate-content-in text-center">
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90">
            <Leaf className="h-3 w-3" />
            Logiciel de Gestion de Ferme
          </span>
          <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl">
            Toute votre ferme,
            <br />
            <span className="text-[#8FE3B3]">une seule ligne à la fois</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm text-white/70 sm:text-base">
            Élevage, cultures, stock, finances, clients et fournisseurs — centralisés dans un seul outil, du poulailler au bureau du comptable.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2 bg-white text-[#0B3B27] hover:bg-white/90">
              <Link to="/login">
                Se connecter au tableau de bord
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
              <Link to="/register">Créer un compte</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <span className="mb-4 inline-block rounded-full bg-[#0F8A5F]/10 px-3 py-1 text-xs font-medium text-[#0F8A5F]">
            Features
          </span>
          <h2 className="text-3xl font-bold text-neutral-900">Ce que le logiciel gère pour vous</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-600">
            Chaque module alimente les autres automatiquement : une vente enregistrée met à jour le stock, la finance, et le solde du client — sans ressaisie.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-5 text-left sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-neutral-200 bg-white p-6 transition-shadow duration-200 hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F8A5F]/10">
                  <Icon className="h-5 w-5 text-[#0F8A5F]" strokeWidth={1.75} />
                </div>
                <p className="font-semibold text-neutral-900">{title}</p>
                <p className="mt-1.5 text-sm text-neutral-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0B3B27] px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-white/90">
            Pensé pour le terrain
          </span>
          <h2 className="text-3xl font-bold text-white">Le réseau coupe. Le travail continue.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">
            Un employé au poulailler ou au champ saisit sa production même sans connexion. Dès que le réseau revient, tout se synchronise seul — rien à refaire, rien à perdre.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/15">
                <WifiOff className="h-5 w-5 text-orange-400" strokeWidth={1.75} />
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-orange-400">Mode</p>
              <p className="font-semibold text-white">Hors Ligne</p>
              <p className="mt-1.5 text-sm text-white/60">Saisie stockée localement, envoyée automatiquement à la reconnexion.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/15">
                <Globe className="h-5 w-5 text-orange-400" strokeWidth={1.75} />
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-orange-400">Multilingue</p>
              <p className="font-semibold text-white">EN - FR - MG</p>
              <p className="mt-1.5 text-sm text-white/60">Français, Malagasy et Anglais pour toute l'équipe, du champ au bureau.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#0B1220] px-6 py-14 text-white/70">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F8A5F]">
                <Leaf className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-white">AgriConnect</span>
            </div>
            <p className="text-sm">
              Toute votre ferme, une seule ligne à la fois. Élevage, cultures, stock, finances, clients et fournisseurs — centralisés dans un seul outil.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">Quick Links</p>
            <ul className="flex flex-col gap-2 text-sm">
              <li><Link to="/login" className="transition-colors hover:text-white">Login</Link></li>
              <li><Link to="/register" className="transition-colors hover:text-white">Register</Link></li>
              {/* Documentation/Support : pas encore de page réelle derrière — texte inerte volontaire plutôt qu'un lien mort */}
              <li className="text-white/40">Documentation</li>
              <li className="text-white/40">Support</li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">Contact Info</p>
            <ul className="flex flex-col gap-2 text-sm">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /> support@zurcher.edu.mg</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /> +261 34 47 885 15</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> Vohitsoa, Sambaina</li>
              <li className="flex items-center gap-2"><Globe className="h-4 w-4 shrink-0" /> agriconnect.zurcher.edu.mg</li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-5xl border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © 2026 AgriConnect. All rights reserved. Empowering sustainable agriculture.
        </div>
      </footer>
    </div>
  )
}