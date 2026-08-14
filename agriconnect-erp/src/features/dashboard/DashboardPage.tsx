import { useAuthStore } from "@/features/auth/authStore"
import { AdminDashboardView } from "./AdminDashboardView"
import { FinanceDashboardView } from "./FinanceDashboardView"
import { OperationsDashboardView } from "./OperationsDashboardView"

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  switch (user.role) {
    case "admin":
      return <AdminDashboardView />
    case "finance_commercial":
      return <FinanceDashboardView />
    case "operations":
      return <OperationsDashboardView />
  }
}