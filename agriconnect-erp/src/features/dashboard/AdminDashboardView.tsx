import { Sprout, Package, AlertTriangle, Wallet, TrendingUp, Handshake } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"
import { formatCurrency, formatNumber } from "@/lib/format"
import { MOCK_DASHBOARD_DATA as data } from "./mockDashboardData"

export function AdminDashboardView() {
  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">Tableau de bord</h2>
      <p className="mb-6 text-sm text-muted-foreground">Vue transversale — tous les modules</p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatCard icon={Sprout} label="Récolte ce mois" value={`${formatNumber(data.production.harvestThisMonth)} kg`} tone="success" />
        <StatCard icon={Package} label="Articles en stock" value={formatNumber(data.stock.totalItems)} tone="primary" />
        <StatCard icon={AlertTriangle} label="Alertes stock bas" value={formatNumber(data.stock.lowStockAlerts)} tone="warning" />
        <StatCard icon={Wallet} label="Chiffre d'affaires" value={formatCurrency(data.finance.revenue)} tone="info" />
        <StatCard icon={TrendingUp} label="Marge nette" value={formatCurrency(data.finance.margin)} tone="success" />
        <StatCard icon={Handshake} label="Clients actifs" value={formatNumber(data.clients.totalClients)} tone="primary" />
      </div>
    </div>
  )
}