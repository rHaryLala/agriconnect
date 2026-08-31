import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { Sprout, Package, Warehouse, AlertTriangle, Plus, Milk, Syringe, MapPin } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"
import { QuickActionsCard, type QuickAction } from "@/components/shared/QuickActionsCard"
import { AlertBanner } from "@/components/shared/AlertBanner"
import { MiniAreaChart } from "@/components/shared/MiniAreaChart"
import { formatNumber } from "@/lib/format"
import { MOCK_DASHBOARD_DATA as data, MOCK_TRENDS as trends, MOCK_STAT_TRENDS as statTrends } from "./mockDashboardData"

export function OuvrierDashboardView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const actions: QuickAction[] = [
    { icon: Plus, label: t("dashboard.quickActions.layerEntry"), onClick: () => navigate("/app/production"), tone: "warning" },
    { icon: Milk, label: t("dashboard.quickActions.milkEntry"), onClick: () => navigate("/app/production"), tone: "info" },
    { icon: MapPin, label: t("dashboard.quickActions.updateParcel"), onClick: () => navigate("/app/production"), tone: "success" },
    { icon: Syringe, label: t("dashboard.quickActions.vetCare"), onClick: () => navigate("/app/production"), tone: "destructive" },
  ]

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">{t("dashboard.ouvrier.title")}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{t("dashboard.ouvrier.subtitle")}</p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Sprout} label={t("dashboard.ouvrier.stats.harvest")} value="" tone="success" trend={statTrends.harvest} animate={{ target: data.production.harvestThisMonth, format: (n) => `${formatNumber(Math.round(n))} kg` }} />
        <StatCard icon={Sprout} label={t("dashboard.ouvrier.stats.activeParcels")} value="" tone="primary" trend={statTrends.activeParcels} animate={{ target: data.production.activeParcels, format: (n) => formatNumber(Math.round(n)) }} />
        <StatCard icon={Package} label={t("dashboard.ouvrier.stats.stockItems")} value="" tone="primary" trend={statTrends.stockItems} animate={{ target: data.stock.totalItems, format: (n) => formatNumber(Math.round(n)) }} />
        <StatCard icon={Warehouse} label={t("dashboard.ouvrier.stats.warehouses")} value="" tone="info" animate={{ target: data.stock.warehouses, format: (n) => formatNumber(Math.round(n)) }} />
        <StatCard icon={AlertTriangle} label={t("dashboard.ouvrier.stats.lowStockAlerts")} value="" tone="warning" trend={statTrends.lowStockAlerts} animate={{ target: data.stock.lowStockAlerts, format: (n) => formatNumber(Math.round(n)) }} />
      </div>

      <div className="mt-4">
        <AlertBanner tone="warning" title={t("dashboard.ouvrier.alertTitle")} description={t("dashboard.ouvrier.alertDescription")} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass-surface rounded-xl p-4 shadow-sm lg:col-span-2">
          <p className="mb-2 text-sm font-medium text-foreground">{t("dashboard.ouvrier.chartTitle")}</p>
          <MiniAreaChart data={trends.production} color="#16A34A" formatValue={(n) => `${formatNumber(n)} kg`} />
        </div>
        <QuickActionsCard title={t("dashboard.quickActions.title")} actions={actions} />
      </div>
    </div>
  )
}