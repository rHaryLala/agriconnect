import { useTranslation } from "react-i18next"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts"
import type { MonthlyPoint } from "@/lib/financeCalc"
import { formatMonthLabel, formatCurrency } from "@/lib/format"

interface FinanceChartProps {
  data: MonthlyPoint[]
}

const COLOR_RECETTES = "#16A34A"
const COLOR_DEPENSES = "#DC2626"

export function FinanceChart({ data }: FinanceChartProps) {
  const { t } = useTranslation()

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-surface text-sm text-muted-foreground">
        {t("finance.overview.noRevenueYet")}
      </div>
    )
  }

  return (
    <div className="h-72 rounded-xl border border-border bg-surface p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.map((d) => ({ ...d, label: formatMonthLabel(d.mois) }))}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} width={90} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Bar dataKey="recettes" name={t("finance.chartLegend.revenue")} fill={COLOR_RECETTES} radius={[4, 4, 0, 0]} />
          <Bar dataKey="depenses" name={t("finance.chartLegend.expenses")} fill={COLOR_DEPENSES} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}