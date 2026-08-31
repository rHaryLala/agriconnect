// src/features/marketing/LandingPage.tsx
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router"
import {
  Leaf, Sprout, Package, Wallet, Handshake, Receipt, BarChart3,
  WifiOff, Globe, Mail, Phone, MapPin, ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher"
import { useCountUp } from "@/hooks/useCountUp"
import { HeroSlideshow } from "./HeroSlideshow"
import { FeatureCard } from "./FeatureCard"

const FEATURE_ICONS = [Sprout, Package, Wallet, Handshake, Receipt, BarChart3]
const FEATURE_KEYS = ["production", "stock", "finance", "clients", "transactions", "reports"]

function StatPill({ target, suffix, labelKey, shortLabelKey }: { target: number; suffix: string; labelKey: string; shortLabelKey: string }) {
  const { t } = useTranslation()
  const value = useCountUp(target, 1100)
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl border border-white/15 bg-white/10 px-2 py-2.5 backdrop-blur-md sm:px-6 sm:py-3">
      <span className="font-serif text-xl text-white sm:text-3xl">
        {Math.round(value)}
        {suffix}
      </span>
      <span className="text-center text-[10px] uppercase leading-tight tracking-wide text-white/70 sm:hidden">{t(shortLabelKey)}</span>
      <span className="hidden text-center text-xs uppercase tracking-wide text-white/70 sm:block">{t(labelKey)}</span>
    </div>
  )
}

export default function LandingPage() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <header
        className={`sticky top-0 z-40 flex h-16 items-center justify-between border-b px-6 backdrop-blur-md transition-colors duration-300 ${
          scrolled ? "border-neutral-200 bg-white/80 shadow-sm" : "border-transparent bg-white/40"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F8A5F]">
            <Leaf className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <span className="font-semibold text-neutral-900">AgriConnect</span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher compact />
          <Link to="/login" className="text-sm text-neutral-600 transition-colors hover:text-neutral-900">
            {t("landing.header.login")}
          </Link>
          <Button asChild size="sm">
            <Link to="/register">{t("landing.header.register")}</Link>
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 py-20 sm:py-28">
        <HeroSlideshow />
        <div className="relative z-10 mx-auto max-w-3xl animate-content-in text-center">
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90">
            <Leaf className="h-3 w-3" />
            {t("landing.hero.badge")}
          </span>
          <h1 className="font-serif text-3xl leading-tight text-white sm:text-5xl">
            {t("landing.hero.titleLine1")}
            <br />
            <span className="text-[#8FE3B3]">{t("landing.hero.titleLine2")}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm text-white/70 sm:text-base">{t("landing.hero.subtitle")}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2 bg-white text-[#0B3B27] transition-transform hover:scale-[1.03] hover:bg-white/90">
              <Link to="/login">
                {t("landing.hero.ctaLogin")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white backdrop-blur-sm transition-transform hover:scale-[1.03] hover:bg-white/10">
              <Link to="/register">{t("landing.hero.ctaRegister")}</Link>
            </Button>
          </div>

          <div className="mt-9 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-3">
            <StatPill target={6} suffix="" labelKey="landing.stats.modules" shortLabelKey="landing.stats.modulesShort" />
            <StatPill target={100} suffix="%" labelKey="landing.stats.offline" shortLabelKey="landing.stats.offlineShort" />
            <StatPill target={3} suffix="" labelKey="landing.stats.languages" shortLabelKey="landing.stats.languagesShort" />
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <span className="mb-4 inline-block rounded-full bg-[#0F8A5F]/10 px-3 py-1 text-xs font-medium text-[#0F8A5F]">{t("landing.features.badge")}</span>
          <h2 className="text-3xl font-bold text-neutral-900">{t("landing.features.title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-600">{t("landing.features.subtitle")}</p>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_KEYS.map((key, i) => (
              <FeatureCard
                key={key}
                icon={FEATURE_ICONS[i]}
                title={t(`landing.features.${key}.title`)}
                description={t(`landing.features.${key}.description`)}
                delayMs={i * 80}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0B3B27] px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-white/90">{t("landing.offline.badge")}</span>
          <h2 className="text-3xl font-bold text-white">{t("landing.offline.title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">{t("landing.offline.subtitle")}</p>

          <div className="mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/15">
                <WifiOff className="h-5 w-5 text-orange-400" strokeWidth={1.75} />
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-orange-400">{t("landing.offline.modeLabel")}</p>
              <p className="font-semibold text-white">{t("landing.offline.modeTitle")}</p>
              <p className="mt-1.5 text-sm text-white/60">{t("landing.offline.modeDescription")}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/15">
                <Globe className="h-5 w-5 text-orange-400" strokeWidth={1.75} />
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-orange-400">{t("landing.offline.langLabel")}</p>
              <p className="font-semibold text-white">{t("landing.offline.langTitle")}</p>
              <p className="mt-1.5 text-sm text-white/60">{t("landing.offline.langDescription")}</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#0B1220] px-6 py-14 text-white/70">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F8A5F]">
                <Leaf className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-white">AgriConnect</span>
            </div>
            <p className="text-sm">{t("landing.footer.tagline")}</p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">{t("landing.footer.quickLinks")}</p>
            <ul className="flex flex-col gap-2 text-sm">
              <li><Link to="/login" className="transition-colors hover:text-white">{t("landing.header.login")}</Link></li>
              <li><Link to="/register" className="transition-colors hover:text-white">{t("landing.header.register")}</Link></li>
              <li className="text-white/40">{t("landing.footer.documentation")}</li>
              <li className="text-white/40">{t("landing.footer.support")}</li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">{t("landing.footer.contactInfo")}</p>
            <ul className="flex flex-col gap-2 text-sm">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /> support@zurcher.edu.mg</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /> +261 34 47 885 15</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> Vohitsoa, Sambaina</li>
              <li className="flex items-center gap-2"><Globe className="h-4 w-4 shrink-0" /> agriconnect.zurcher.edu.mg</li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-5xl border-t border-white/10 pt-6 text-center text-xs text-white/40">{t("landing.footer.copyright")}</div>
      </footer>
    </div>
  )
}