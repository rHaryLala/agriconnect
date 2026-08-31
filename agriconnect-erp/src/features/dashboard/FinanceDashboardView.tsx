import { useEffect, useMemo } from "react"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { Wallet, TrendingDown, TrendingUp, FileWarning, Handshake, Plus, Minus, FileText, Download } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"
import { QuickActionsCard, type QuickAction } from "@/components/shared/QuickActionsCard"
import { formatCurrency, formatNumber, formatMonthLabel } from "@/lib/format"
import { MOCK_DASHBOARD_DATA as data } from "./mockDashboardData"
import { useFinanceStore } from "@/features/finance/financeStore"
import { computeMonthlySeries, computeMonthOverMonth } from "@/lib/financeCalc"
import { MiniAreaChart } from "@/components/shared/MiniAreaChart"

export function FinanceDashboardView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { transactions, fetchAll } = useFinanceStore()

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const chartData = useMemo(
    () => computeMonthlySeries(transactions).map((p) => ({ label: formatMonthLabel(p.mois), value: p.recettes - p.depenses })),
    [transactions]
  )
  const revenueTrend = useMemo(() => computeMonthOverMonth(transactions, "recette"), [transactions])
  const expenseTrend = useMemo(() => computeMonthOverMonth(transactions, "depense"), [transactions])

  const actions: QuickAction[] = [
    { icon: Plus, label: t("dashboard.quickActions.recordRevenue"), onClick: () => navigate("/app/finance"), tone: "success" },
    { icon: Minus, label: t("dashboard.quickActions.recordExpense"), onClick: () => navigate("/app/finance"), tone: "destructive" },
    { icon: FileText, label: t("dashboard.quickActions.createInvoice"), onClick: () => navigate("/app/clients-fournisseurs"), tone: "warning" },
    { icon: Download, label: t("dashboard.quickActions.exportReport"), onClick: () => navigate("/app/rapports"), tone: "info" },
  ]

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">{t("dashboard.finance.title")}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{t("dashboard.finance.subtitle")}</p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Wallet} label={t("dashboard.finance.stats.revenue")} value="" tone="info" trend={revenueTrend.previousTotal > 0 ? { value: revenueTrend.changePercent, isPositive: revenueTrend.changePercent >= 0 } : undefined} animate={{ target: data.finance.revenue, format: (n) => formatCurrency(Math.round(n)) }} />
        <StatCard icon={TrendingDown} label={t("dashboard.finance.stats.expenses")} value="" tone="destructive" trend={expenseTrend.previousTotal > 0 ? { value: expenseTrend.changePercent, isPositive: expenseTrend.changePercent <= 0 } : undefined} animate={{ target: data.finance.expenses, format: (n) => formatCurrency(Math.round(n)) }} />
        <StatCard icon={TrendingUp} label={t("dashboard.finance.stats.margin")} value="" tone="success" animate={{ target: data.finance.margin, format: (n) => formatCurrency(Math.round(n)) }} />
        <StatCard icon={FileWarning} label={t("dashboard.finance.stats.unpaidInvoices")} value="" tone="warning" animate={{ target: data.finance.unpaidInvoices, format: (n) => formatNumber(Math.round(n)) }} />
        <StatCard icon={Handshake} label={t("dashboard.finance.stats.clients")} value="" tone="primary" animate={{ target: data.clients.totalClients, format: (n) => formatNumber(Math.round(n)) }} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass-surface rounded-xl p-4 shadow-sm lg:col-span-2">
          <p className="mb-2 text-sm font-medium text-foreground">{t("dashboard.finance.chartTitle")}</p>
          <MiniAreaChart data={chartData} color="#0F8A5F" formatValue={(n) => formatCurrency(n)} />
        </div>
        <QuickActionsCard title={t("dashboard.quickActions.title")} actions={actions} />
      </div>
    </div>
  )
}