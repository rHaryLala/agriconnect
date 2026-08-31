import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Wallet, TrendingDown, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"
import { FinanceChart } from "./FinanceChart"
import { CategoryBreakdownChart } from "./CategoryBreakdownChart"
import { computeTotals, computeMonthlySeries } from "@/lib/financeCalc"
import { formatCurrency } from "@/lib/format"
import type { FinanceTransaction } from "@/types/finance"

interface FinanceOverviewTabProps {
  transactions: FinanceTransaction[]
}

export function FinanceOverviewTab({ transactions }: FinanceOverviewTabProps) {
  const { t } = useTranslation()
  const { totalRecettes, totalDepenses, marge } = useMemo(() => computeTotals(transactions), [transactions])
  const monthlySeries = useMemo(() => computeMonthlySeries(transactions), [transactions])

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={TrendingUp} label={t("finance.overview.statRevenue")} value="" tone="success" animate={{ target: totalRecettes, format: (n) => formatCurrency(Math.round(n)) }} />
        <StatCard icon={TrendingDown} label={t("finance.overview.statExpenses")} value="" tone="destructive" animate={{ target: totalDepenses, format: (n) => formatCurrency(Math.round(n)) }} />
        <StatCard icon={Wallet} label={t("finance.overview.statMargin")} value="" tone={marge >= 0 ? "success" : "destructive"} animate={{ target: marge, format: (n) => formatCurrency(Math.round(n)) }} />
      </div>

      <div className="mb-6">
        <FinanceChart data={monthlySeries} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">{t("finance.overview.breakdownExpenses")}</p>
          <CategoryBreakdownChart transactions={transactions} type="depense" />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">{t("finance.overview.breakdownRevenue")}</p>
          <CategoryBreakdownChart transactions={transactions} type="recette" />
        </div>
      </div>
    </div>
  )
}