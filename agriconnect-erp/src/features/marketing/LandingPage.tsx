import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router"
import {
  Leaf, Sprout, Package, Wallet, Handshake, Receipt, BarChart3,
  WifiOff, Globe, Mail, Phone, MapPin, ArrowRight,
  LogIn, UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher"
import { useCountUp } from "@/hooks/useCountUp"
import { useScrollProgress } from "@/hooks/useScrollProgress"
import { supportsHover } from "@/lib/motion"
import { HeroSlideshow } from "./HeroSlideshow"
import { FeatureCard } from "./FeatureCard"
import { Reveal } from "./Reveal"
import { SectionVideoBackdrop } from "./SectionVideoBackdrop"
import { usePinnedTrack } from "./usePinnedTrack"

const FEATURE_ICONS = [Sprout, Package, Wallet, Handshake, Receipt, BarChart3]
const FEATURE_KEYS = ["production", "stock", "finance", "clients", "transactions", "reports"]

function StatPill({ target, suffix, labelKey, shortLabelKey }: { target: number; suffix: string; labelKey: string; shortLabelKey: string }) {
  const { t } = useTranslation()
  const value = useCountUp(target, 1100)
  return (
    <div className="glass-liquid flex flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 transition-transform duration-500 ease-out hover:-translate-y-0.5 sm:px-6 sm:py-3">
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

  const [scrollEffects] = useState(supportsHover)
  const heroRef = useScrollProgress<HTMLElement>(scrollEffects)
  const offlineRef = useScrollProgress<HTMLElement>(scrollEffects)

  const pinned = usePinnedTrack()
  const featuresRef = useScrollProgress<HTMLElement>(pinned)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <header
        className={`sticky top-0 z-40 flex h-16 items-center justify-between border-b px-6 backdrop-blur-xl backdrop-saturate-150 transition-[background-color,border-color,box-shadow] duration-500 ${
          scrolled
            ? "border-white/50 bg-white/70 shadow-[0_8px_32px_-18px_rgb(0_0_0/0.45)]"
            : "border-transparent bg-white/40"
        }`}
      >
        <div className="group flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F8A5F] transition-transform duration-500 ease-out group-hover:rotate-6 group-hover:scale-110">
            <Leaf className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <span className="font-semibold text-neutral-900">AgriConnect</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher compact />

          <Link
            to="/login"
            aria-label={t("landing.header.login")}
            title={t("landing.header.login")}
            className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 sm:hidden"
          >
            <LogIn className="h-4 w-4" strokeWidth={1.75} />
          </Link>
          <Button asChild size="icon" className="sm:hidden" aria-label={t("landing.header.register")}>
            <Link to="/register" title={t("landing.header.register")}>
              <UserPlus className="h-4 w-4" />
            </Link>
          </Button>

          <Link to="/login" className="hidden text-sm text-neutral-600 transition-colors hover:text-neutral-900 sm:inline">
            {t("landing.header.login")}
          </Link>
          <Button asChild size="sm" className="hidden transition-transform duration-300 hover:scale-[1.04] sm:inline-flex">
            <Link to="/register">{t("landing.header.register")}</Link>
          </Button>
        </div>
      </header>

      <section ref={heroRef} className="relative overflow-hidden px-6 py-20 sm:py-28">
        <HeroSlideshow />
        <div className="hero-depth relative z-10 mx-auto max-w-3xl">
          <div className="animate-content-in text-center">
            <span className="glass-liquid mb-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-white/90">
              <Leaf className="h-3 w-3" />
              {t("landing.hero.badge")}
            </span>
            <h1 className="font-serif text-3xl leading-tight text-white text-shadow-sm sm:text-5xl">
              {t("landing.hero.titleLine1")}
              <br />
              <span className="text-[#8FE3B3]">{t("landing.hero.titleLine2")}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm text-white/70 sm:text-base">{t("landing.hero.subtitle")}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="group gap-2 bg-white text-[#0B3B27] transition-all duration-300 hover:scale-[1.03] hover:bg-white/90 hover:shadow-lg hover:shadow-white/20">
                <Link to="/login">
                  {t("landing.hero.ctaLogin")}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="glass-liquid text-white transition-transform duration-300 hover:scale-[1.03]">
                <Link to="/register">{t("landing.hero.ctaRegister")}</Link>
              </Button>
            </div>

            <div className="mt-9 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-3">
              <StatPill target={6} suffix="" labelKey="landing.stats.modules" shortLabelKey="landing.stats.modulesShort" />
              <StatPill target={100} suffix="%" labelKey="landing.stats.offline" shortLabelKey="landing.stats.offlineShort" />
              <StatPill target={3} suffix="" labelKey="landing.stats.languages" shortLabelKey="landing.stats.languagesShort" />
            </div>
          </div>
        </div>
      </section>

      <section
        ref={featuresRef}
        data-pinned={pinned}
        className="pin-section relative overflow-clip bg-[#06281B] py-20 sm:py-28 lg:py-36"
      >
        <SectionVideoBackdrop
          videoSrc="/backgrounds/back.mp4"
          posterSrc="/backgrounds/back-poster.webp"
          overlayClassName="bg-gradient-to-b from-[#06281B]/90 via-[#06281B]/75 to-[#06281B]/95"
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-40 bg-gradient-to-b from-[#06281B] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-40 bg-gradient-to-t from-[#06281B] to-transparent" />

        <div className="pin-stage relative z-10">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <Reveal>
              <span className="glass-liquid mb-4 inline-block rounded-full px-3 py-1 text-xs font-medium text-white/90">{t("landing.features.badge")}</span>
              <h2 className="text-3xl font-bold text-white text-shadow-sm">{t("landing.features.title")}</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">{t("landing.features.subtitle")}</p>
            </Reveal>
          </div>

          <div className="pin-track mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 px-6 text-left sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {FEATURE_KEYS.map((key, i) => (
              <FeatureCard
                key={key}
                icon={FEATURE_ICONS[i]}
                title={t(`landing.features.${key}.title`)}
                description={t(`landing.features.${key}.description`)}
                delayMs={pinned ? 0 : (i % 3) * 110}
              />
            ))}
          </div>
        </div>
      </section>

      <section ref={offlineRef} className="relative overflow-hidden bg-[#0B3B27] px-6 py-20 text-center">
        <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[#0F8A5F]/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#8FE3B3]/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <Reveal>
            <span className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-white/90">{t("landing.offline.badge")}</span>
            <h2 className="text-3xl font-bold text-white">{t("landing.offline.title")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">{t("landing.offline.subtitle")}</p>
          </Reveal>

          <div className="scroll-tilt mt-10 grid grid-cols-1 gap-4 text-left [--scroll-tilt-deg:6deg] sm:grid-cols-2">
            <Reveal className="group">
              <div className="glass-liquid h-full rounded-xl p-6 transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/15 transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110">
                  <WifiOff className="h-5 w-5 text-orange-400" strokeWidth={1.75} />
                </div>
                <p className="text-xs font-medium uppercase tracking-wide text-orange-400">{t("landing.offline.modeLabel")}</p>
                <p className="font-semibold text-white">{t("landing.offline.modeTitle")}</p>
                <p className="mt-1.5 text-sm text-white/60">{t("landing.offline.modeDescription")}</p>
              </div>
            </Reveal>
            <Reveal className="group" delayMs={120}>
              <div className="glass-liquid h-full rounded-xl p-6 transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/15 transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110">
                  <Globe className="h-5 w-5 text-orange-400" strokeWidth={1.75} />
                </div>
                <p className="text-xs font-medium uppercase tracking-wide text-orange-400">{t("landing.offline.langLabel")}</p>
                <p className="font-semibold text-white">{t("landing.offline.langTitle")}</p>
                <p className="mt-1.5 text-sm text-white/60">{t("landing.offline.langDescription")}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <footer className="bg-[#0B1220] px-6 py-14 text-white/70">
        <Reveal>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3">
            <div>
              <div className="group mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F8A5F] transition-transform duration-500 ease-out group-hover:rotate-6 group-hover:scale-110">
                  <Leaf className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-semibold text-white">AgriConnect</span>
              </div>
              <p className="text-sm">{t("landing.footer.tagline")}</p>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-white">{t("landing.footer.quickLinks")}</p>
              <ul className="flex flex-col gap-2 text-sm">
                <li><Link to="/login" className="inline-block transition-all duration-300 hover:translate-x-1 hover:text-white">{t("landing.header.login")}</Link></li>
                <li><Link to="/register" className="inline-block transition-all duration-300 hover:translate-x-1 hover:text-white">{t("landing.header.register")}</Link></li>
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
        </Reveal>

        <div className="mx-auto mt-10 max-w-5xl border-t border-white/10 pt-6 text-center text-xs text-white/40">{t("landing.footer.copyright")}</div>
      </footer>
    </div>
  )
}
