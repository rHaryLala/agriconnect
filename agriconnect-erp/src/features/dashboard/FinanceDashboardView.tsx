import { useEffect, useMemo } from "react"
import { useNavigate } from "react-router"
import { Wallet, TrendingDown, TrendingUp, Receipt, ListChecks, Plus, Minus, FileText, Download } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"
import { QuickActionsCard, type QuickAction } from "@/components/shared/QuickActionsCard"
import { formatCurrency, formatMonthLabel } from "@/lib/format"
import { useFinanceStore } from "@/features/finance/financeStore"
import { computeTotals, computeMonthlySeries, computeMonthOverMonth } from "@/lib/financeCalc"
import { MiniAreaChart } from "@/components/shared/MiniAreaChart"

export function FinanceDashboardView() {
  const navigate = useNavigate()
  const { transactions, fetchAll } = useFinanceStore()

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const { totalRecettes, totalDepenses, marge } = useMemo(() => computeTotals(transactions), [transactions])

  const chartData = useMemo(
    () => computeMonthlySeries(transactions).map((p) => ({ label: formatMonthLabel(p.mois), value: p.recettes - p.depenses })),
    [transactions]
  )

  const revenueTrend = useMemo(() => computeMonthOverMonth(transactions, "recette"), [transactions])
  const expenseTrend = useMemo(() => computeMonthOverMonth(transactions, "depense"), [transactions])

  const currentMonth = new Date().toISOString().slice(0, 7)
  const transactionsCeMois = useMemo(() => transactions.filter((t) => t.date.startsWith(currentMonth)).length, [transactions, currentMonth])

  const actions: QuickAction[] = [
    { icon: Plus, label: "Enregistrer revenu", onClick: () => navigate("/app/finance"), tone: "success" },
    { icon: Minus, label: "Enregistrer dépense", onClick: () => navigate("/app/finance"), tone: "destructive" },
    { icon: FileText, label: "Créer facture", onClick: () => navigate("/app/clients-fournisseurs"), tone: "warning" },
    { icon: Download, label: "Exporter rapport PDF", onClick: () => navigate("/app/rapports"), tone: "info" },
  ]

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">Tableau de bord — Finance</h2>
      <p className="mb-6 text-sm text-muted-foreground">Recettes, dépenses, marge</p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard
          icon={Wallet}
          label="Chiffre d'affaires"
          value={formatCurrency(totalRecettes)}
          tone="info"
          trend={revenueTrend.previousTotal > 0 ? { value: revenueTrend.changePercent, isPositive: revenueTrend.changePercent >= 0 } : undefined}
        />
        <StatCard
          icon={TrendingDown}
          label="Dépenses"
          value={formatCurrency(totalDepenses)}
          tone="destructive"
          trend={expenseTrend.previousTotal > 0 ? { value: expenseTrend.changePercent, isPositive: expenseTrend.changePercent <= 0 } : undefined}
        />
        <StatCard icon={TrendingUp} label="Marge nette" value={formatCurrency(marge)} tone={marge >= 0 ? "success" : "destructive"} />
        <StatCard icon={Receipt} label="Transactions ce mois" value={String(transactionsCeMois)} tone="warning" />
        <StatCard icon={ListChecks} label="Total transactions" value={String(transactions.length)} tone="primary" hint="Depuis le début" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass-surface rounded-xl p-4 shadow-sm lg:col-span-2">
          <p className="mb-2 text-sm font-medium text-foreground">Marge nette — historique réel des transactions</p>
          <MiniAreaChart data={chartData} color="#0F8A5F" formatValue={(n) => formatCurrency(n)} />
        </div>
        <QuickActionsCard actions={actions} />
      </div>
    </div>
  )
}