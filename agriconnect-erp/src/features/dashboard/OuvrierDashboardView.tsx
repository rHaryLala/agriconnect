import { Sprout, Package, Warehouse, AlertTriangle } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"
import { formatNumber } from "@/lib/format"
import { MOCK_DASHBOARD_DATA as data } from "./mockDashboardData"

export function OuvrierDashboardView() {
  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">Tableau de bord — Production</h2>
      <p className="mb-6 text-sm text-muted-foreground">Production, stock, mouvements</p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Sprout} label="Récolte ce mois" value={`${formatNumber(data.production.harvestThisMonth)} kg`} tone="success" />
        <StatCard icon={Sprout} label="Parcelles actives" value={formatNumber(data.production.activeParcels)} tone="primary" />
        <StatCard icon={Package} label="Articles en stock" value={formatNumber(data.stock.totalItems)} tone="primary" />
        <StatCard icon={Warehouse} label="Entrepôts" value={formatNumber(data.stock.warehouses)} tone="info" />
        <StatCard icon={AlertTriangle} label="Alertes stock bas" value={formatNumber(data.stock.lowStockAlerts)} tone="warning" />
      </div>
    </div>
  )
}