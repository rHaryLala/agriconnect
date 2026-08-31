import { useTranslation } from "react-i18next"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { formatCurrency } from "@/lib/format"
import type { FinanceTransaction, TransactionType } from "@/types/finance"

interface CategoryBreakdownChartProps {
  transactions: FinanceTransaction[]
  type: TransactionType
}

const COLORS = ["#0F8A5F", "#22C55E", "#F59E0B", "#2563EB", "#DC2626", "#8B5CF6", "#EC4899"]

export function CategoryBreakdownChart({ transactions, type }: CategoryBreakdownChartProps) {
  const { t } = useTranslation()
  const byCategory = new Map<string, number>()
  transactions.filter((t) => t.type === type).forEach((tx) => byCategory.set(tx.categorie, (byCategory.get(tx.categorie) ?? 0) + tx.montant))
  const data = Array.from(byCategory.entries()).map(([name, value]) => ({ name, value }))

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-border bg-surface text-sm text-muted-foreground">
        {type === "recette" ? t("finance.overview.noRevenueYet") : t("finance.overview.noExpensesYet")}
      </div>
    )
  }

  return (
    <div className="h-56 rounded-xl border border-border bg-surface p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => formatCurrency(v)} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}