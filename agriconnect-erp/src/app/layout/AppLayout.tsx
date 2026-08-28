import { useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { MobileBottomNav } from "./MobileBottomNav"

export function AppLayout() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="flex h-screen flex-col">
      <Header onMenuClick={() => setMobileMenuOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 animate-fade-in bg-black/50" onClick={() => setMobileMenuOpen(false)} aria-hidden />
            <div className="absolute inset-y-0 left-0 w-64 animate-content-in bg-surface shadow-xl">
              <Sidebar onNavigate={() => setMobileMenuOpen(false)} forceExpanded />
            </div>
          </div>
        )}

        <main className="relative flex-1 overflow-y-auto bg-background p-4 pb-24 sm:p-6 lg:pb-6">
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-fixed opacity-[0.025] dark:opacity-[0.04]"
            style={{ backgroundImage: "url(/hero/hero-06.jpg)" }}
          />
          <div key={location.pathname} className="animate-content-in">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileBottomNav onMenuClick={() => setMobileMenuOpen(true)} />
    </div>
  )
}