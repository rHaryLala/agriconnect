import { useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { MobileBottomNav } from "./MobileBottomNav"
import { useTheme } from "@/hooks/useTheme"
import { useTranslation } from "react-i18next"

export function AppLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const { theme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [lastPathname, setLastPathname] = useState(location.pathname)
  if (location.pathname !== lastPathname) {
    setLastPathname(location.pathname)
    setMobileMenuOpen(false)
  }

  const bgImage = theme === "dark" ? "/backgrounds/app-bg-dark.webp" : "/backgrounds/app-bg-light.webp"

  // Échap ferme le panneau de navigation mobile. Sans cela il ne se referme
  // qu'au clic sur le voile, qui est aria-hidden et donc hors d'atteinte au
  // clavier : l'utilisateur restait enfermé dans le menu.
  useEffect(() => {
    if (!mobileMenuOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileMenuOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [mobileMenuOpen])

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Lien d'évitement : première cible de tabulation de la page, invisible
          jusqu'à ce qu'il reçoive le focus. Il évite de retraverser la barre
          latérale et l'en-tête à chaque changement de page. */}
      <a
        href="#contenu-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {t("a11y.skipToContent")}
      </a>
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <img key={bgImage} src={bgImage} alt="" className="h-full w-full scale-105 object-cover blur-md" />
        <div className="absolute inset-0 bg-background/50 dark:bg-background/60" />
      </div>

      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-black/50" onClick={() => setMobileMenuOpen(false)} aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.menu")}
            className="absolute inset-y-0 left-0 w-64 animate-content-in bg-surface shadow-xl"
          >
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} forceExpanded />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main
          id="contenu-principal"
          tabIndex={-1}
          className="relative flex-1 overflow-y-auto p-4 pb-24 focus-visible:outline-none sm:p-6 lg:pb-6"
        >
          <div key={location.pathname} className="animate-content-in">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileBottomNav onMenuClick={() => setMobileMenuOpen(true)} />
    </div>
  )
}