import { useAuthStore } from "@/features/auth/authStore"
import { AdminDashboardView } from "./AdminDashboardView"
import { FinanceDashboardView } from "./FinanceDashboardView"
import { OuvrierDashboardView } from "./OuvrierDashboardView"

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  switch (user.role) {
    case "admin":
      return <AdminDashboardView />
    case "finance_commercial":
      return <FinanceDashboardView />
    case "ouvrier":
      return <OuvrierDashboardView />
  }
}