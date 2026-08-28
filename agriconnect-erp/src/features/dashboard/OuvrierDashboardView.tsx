import { useNavigate } from "react-router"
import { Sprout, Package, Warehouse, AlertTriangle, Plus, Syringe, MapPin } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"
import { QuickActionsCard, type QuickAction } from "@/components/shared/QuickActionsCard"
import { AlertBanner } from "@/components/shared/AlertBanner"
import { MiniAreaChart } from "@/components/shared/MiniAreaChart"
import { formatNumber } from "@/lib/format"
import { MOCK_DASHBOARD_DATA as data, MOCK_TRENDS as trends, MOCK_STAT_TRENDS as statTrends } from "./mockDashboardData"

export function OuvrierDashboardView() {
  const navigate = useNavigate()

  const actions: QuickAction[] = [
    { icon: Plus, label: "Saisir production pondeuses", onClick: () => navigate("/app/production"), tone: "warning" },
    { icon: Plus, label: "Enregistrer collecte lait", onClick: () => navigate("/app/production"), tone: "info" },
    { icon: MapPin, label: "Mettre à jour parcelle", onClick: () => navigate("/app/production"), tone: "success" },
    { icon: Syringe, label: "Saisir soin vétérinaire", onClick: () => navigate("/app/production"), tone: "destructive" },
  ]

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">Tableau de bord — Production</h2>
      <p className="mb-6 text-sm text-muted-foreground">Production, stock, mouvements</p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Sprout} label="Récolte ce mois" value="" tone="success" trend={statTrends.harvest} animate={{ target: data.production.harvestThisMonth, format: (n) => `${formatNumber(Math.round(n))} kg` }} />
        <StatCard icon={Sprout} label="Parcelles actives" value="" tone="primary" trend={statTrends.activeParcels} animate={{ target: data.production.activeParcels, format: (n) => formatNumber(Math.round(n)) }} />
        <StatCard icon={Package} label="Articles en stock" value="" tone="primary" trend={statTrends.stockItems} animate={{ target: data.stock.totalItems, format: (n) => formatNumber(Math.round(n)) }} />
        <StatCard icon={Warehouse} label="Entrepôts" value="" tone="info" animate={{ target: data.stock.warehouses, format: (n) => formatNumber(Math.round(n)) }} />
        <StatCard icon={AlertTriangle} label="Alertes stock bas" value="" tone="warning" trend={statTrends.lowStockAlerts} animate={{ target: data.stock.lowStockAlerts, format: (n) => formatNumber(Math.round(n)) }} />
      </div>

      <div className="mt-4">
        <AlertBanner tone="warning" title="Taux de ponte en baisse — Bande B" description="74% aujourd'hui vs 78% la semaine dernière. Vérifier l'alimentation." />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass-surface rounded-xl p-4 shadow-sm lg:col-span-2">
          <p className="mb-2 text-sm font-medium text-foreground">Récolte — 6 derniers mois</p>
          <MiniAreaChart data={trends.production} color="#16A34A" formatValue={(n) => `${formatNumber(n)} kg`} />
        </div>
        <QuickActionsCard actions={actions} />
      </div>
    </div>
  )
}