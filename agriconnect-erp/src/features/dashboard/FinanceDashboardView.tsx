import { Wallet, TrendingDown, TrendingUp, FileWarning, Handshake } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"
import { formatCurrency, formatNumber } from "@/lib/format"
import { MOCK_DASHBOARD_DATA as data } from "./mockDashboardData"

export function FinanceDashboardView() {
  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">Tableau de bord — Finance</h2>
      <p className="mb-6 text-sm text-muted-foreground">Recettes, dépenses, marge, clients</p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Wallet} label="Chiffre d'affaires" value={formatCurrency(data.finance.revenue)} tone="info" />
        <StatCard icon={TrendingDown} label="Dépenses" value={formatCurrency(data.finance.expenses)} tone="destructive" />
        <StatCard icon={TrendingUp} label="Marge nette" value={formatCurrency(data.finance.margin)} tone="success" />
        <StatCard icon={FileWarning} label="Factures impayées" value={formatNumber(data.finance.unpaidInvoices)} tone="warning" />
        <StatCard icon={Handshake} label="Clients actifs" value={formatNumber(data.clients.totalClients)} tone="primary" />
      </div>
    </div>
  )
}