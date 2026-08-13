import { Outlet, useLocation } from "react-router"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"

export function AppLayout() {
  const location = useLocation()

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div key={location.pathname} className="animate-content-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}