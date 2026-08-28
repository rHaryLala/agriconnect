import { useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { MobileBottomNav } from "./MobileBottomNav"
import { useTheme } from "@/hooks/useTheme"

export function AppLayout() {
  const location = useLocation()
  const { theme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const bgImage = theme === "dark" ? "/backgrounds/app-bg-dark.jpg" : "/backgrounds/app-bg-light.jpg"

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10">
        <img key={bgImage} src={bgImage} alt="" className="h-full w-full scale-110 object-cover blur-2xl" />
        <div className="absolute inset-0 bg-background/90" />
      </div>

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

        <main className="relative flex-1 overflow-y-auto p-4 pb-24 sm:p-6 lg:pb-6">
          <div key={location.pathname} className="animate-content-in">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileBottomNav onMenuClick={() => setMobileMenuOpen(true)} />
    </div>
  )
}