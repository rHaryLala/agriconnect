import { Sprout, Package, AlertTriangle, Wallet, TrendingUp, Handshake } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"
import { MiniAreaChart } from "@/components/shared/MiniAreaChart"
import { formatCurrency, formatNumber } from "@/lib/format"
import { MOCK_DASHBOARD_DATA as data, MOCK_TRENDS as trends } from "./mockDashboardData"

export function AdminDashboardView() {
  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">Tableau de bord</h2>
      <p className="mb-6 text-sm text-muted-foreground">Vue transversale — tous les modules</p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatCard icon={Sprout} label="Récolte ce mois" value="" tone="success" animate={{ target: data.production.harvestThisMonth, format: (n) => `${formatNumber(Math.round(n))} kg` }} />
        <StatCard icon={Package} label="Articles en stock" value="" tone="primary" animate={{ target: data.stock.totalItems, format: (n) => formatNumber(Math.round(n)) }} />
        <StatCard icon={AlertTriangle} label="Alertes stock bas" value="" tone="warning" animate={{ target: data.stock.lowStockAlerts, format: (n) => formatNumber(Math.round(n)) }} />
        <StatCard icon={Wallet} label="Chiffre d'affaires" value="" tone="info" animate={{ target: data.finance.revenue, format: (n) => formatCurrency(Math.round(n)) }} />
        <StatCard icon={TrendingUp} label="Marge nette" value="" tone="success" animate={{ target: data.finance.margin, format: (n) => formatCurrency(Math.round(n)) }} />
        <StatCard icon={Handshake} label="Clients actifs" value="" tone="primary" animate={{ target: data.clients.totalClients, format: (n) => formatNumber(Math.round(n)) }} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 text-sm font-medium text-foreground">Récolte — 6 derniers mois</p>
          <MiniAreaChart data={trends.production} color="#16A34A" formatValue={(n) => `${formatNumber(n)} kg`} />
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 text-sm font-medium text-foreground">Stock — 6 derniers mois</p>
          <MiniAreaChart data={trends.stock} color="#0F8A5F" formatValue={(n) => formatNumber(n)} />
        </div>
      </div>
    </div>
  )
}