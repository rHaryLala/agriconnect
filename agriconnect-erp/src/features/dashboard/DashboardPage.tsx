import { useEffect } from "react"
import { useAuthStore } from "@/features/auth/authStore"
import { AdminDashboardView } from "./AdminDashboardView"
import { FinanceDashboardView } from "./FinanceDashboardView"
import { OuvrierDashboardView } from "./OuvrierDashboardView"
import { useDashboardStore } from "./dashboardStore"

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const fetchAll = useDashboardStore((s) => s.fetchAll)

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  if (!user) return null

  switch (user.role) {
    case "admin":
      return <AdminDashboardView />
    case "comptable":
    // Le contrôleur interne lit l'ensemble sans rien écrire : la vue comptable
    // est celle qui correspond à son périmètre.
    case "controleur_interne":
      return <FinanceDashboardView />
    case "ouvrier":
    // Le magasinier travaille sur la production et le stock, comme l'ouvrier.
    case "magasinier":
      return <OuvrierDashboardView />
  }
}
