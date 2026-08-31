import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { Sprout, Package, AlertTriangle, Wallet, TrendingUp, Handshake, Plus, Minus, ArrowDownCircle, FileText } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"
import { QuickActionsCard, type QuickAction } from "@/components/shared/QuickActionsCard"
import { AlertBanner } from "@/components/shared/AlertBanner"
import { ActivityFeed, type ActivityItem } from "@/components/shared/ActivityFeed"
import { MiniAreaChart } from "@/components/shared/MiniAreaChart"
import { formatCurrency, formatNumber } from "@/lib/format"
import { MOCK_DASHBOARD_DATA as data, MOCK_TRENDS as trends, MOCK_STAT_TRENDS as statTrends } from "./mockDashboardData"

export function AdminDashboardView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const actions: QuickAction[] = [
    { icon: Plus, label: t("dashboard.quickActions.addProduction"), onClick: () => navigate("/app/production"), tone: "success" },
    { icon: Minus, label: t("dashboard.quickActions.addExpense"), onClick: () => navigate("/app/finance"), tone: "destructive" },
    { icon: Plus, label: t("dashboard.quickActions.addRevenue"), onClick: () => navigate("/app/finance"), tone: "success" },
    { icon: ArrowDownCircle, label: t("dashboard.quickActions.stockEntry"), onClick: () => navigate("/app/stocks"), tone: "info" },
    { icon: FileText, label: t("dashboard.quickActions.createInvoice"), onClick: () => navigate("/app/clients-fournisseurs"), tone: "warning" },
  ]

  const ACTIVITY: ActivityItem[] = [
    { id: "1", icon: Sprout, title: t("dashboard.activity.item1Title"), subtitle: t("dashboard.activity.item1Subtitle"), time: t("dashboard.activity.time1h"), tone: "success" },
    { id: "2", icon: Package, title: t("dashboard.activity.item2Title"), subtitle: t("dashboard.activity.item2Subtitle"), time: t("dashboard.activity.time3h"), tone: "info" },
    { id: "3", icon: Handshake, title: t("dashboard.activity.item3Title"), subtitle: t("dashboard.activity.item3Subtitle"), time: t("dashboard.activity.time5h"), tone: "primary" },
    { id: "4", icon: AlertTriangle, title: t("dashboard.activity.item4Title"), subtitle: t("dashboard.activity.item4Subtitle"), time: t("dashboard.activity.timeYesterday"), tone: "warning" },
  ]

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">{t("dashboard.admin.title")}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{t("dashboard.admin.subtitle")}</p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatCard icon={Sprout} label={t("dashboard.admin.stats.harvest")} value="" tone="success" trend={statTrends.harvest} animate={{ target: data.production.harvestThisMonth, format: (n) => `${formatNumber(Math.round(n))} kg` }} />
        <StatCard icon={Package} label={t("dashboard.admin.stats.stockItems")} value="" tone="primary" trend={statTrends.stockItems} animate={{ target: data.stock.totalItems, format: (n) => formatNumber(Math.round(n)) }} />
        <StatCard icon={AlertTriangle} label={t("dashboard.admin.stats.lowStockAlerts")} value="" tone="warning" trend={statTrends.lowStockAlerts} animate={{ target: data.stock.lowStockAlerts, format: (n) => formatNumber(Math.round(n)) }} />
        <StatCard icon={Wallet} label={t("dashboard.admin.stats.revenue")} value="" tone="info" animate={{ target: data.finance.revenue, format: (n) => formatCurrency(Math.round(n)) }} />
        <StatCard icon={TrendingUp} label={t("dashboard.admin.stats.margin")} value="" tone="success" animate={{ target: data.finance.margin, format: (n) => formatCurrency(Math.round(n)) }} />
        <StatCard icon={Handshake} label={t("dashboard.admin.stats.clients")} value="" tone="primary" trend={statTrends.activeParcels} animate={{ target: data.clients.totalClients, format: (n) => formatNumber(Math.round(n)) }} />
      </div>

      <div className="mt-4">
        <AlertBanner tone="warning" title={t("dashboard.admin.alertTitle")} description={t("dashboard.admin.alertDescription")} action={{ label: t("dashboard.admin.alertAction"), onClick: () => navigate("/app/stocks") }} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          <div className="glass-surface rounded-xl p-4 shadow-sm">
            <p className="mb-2 text-sm font-medium text-foreground">{t("dashboard.admin.chartHarvest")}</p>
            <MiniAreaChart data={trends.production} color="#16A34A" formatValue={(n) => `${formatNumber(n)} kg`} />
          </div>
          <div className="glass-surface rounded-xl p-4 shadow-sm">
            <p className="mb-2 text-sm font-medium text-foreground">{t("dashboard.admin.chartStock")}</p>
            <MiniAreaChart data={trends.stock} color="#0F8A5F" formatValue={(n) => formatNumber(n)} />
          </div>
        </div>
        <QuickActionsCard title={t("dashboard.quickActions.title")} actions={actions} />
      </div>

      <div className="mt-6">
        <ActivityFeed title={t("dashboard.activity.title")} items={ACTIVITY} onViewAll={() => navigate("/app/rapports")} />
      </div>
    </div>
  )
}