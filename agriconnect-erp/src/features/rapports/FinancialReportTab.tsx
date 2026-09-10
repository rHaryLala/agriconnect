import { useTranslation } from "react-i18next"
import { FileDown, Sheet, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { computeTotals } from "@/lib/financeCalc"
import { inRange } from "@/lib/reportsCalc"
import { formatCurrency, formatDate } from "@/lib/format"
import { exportToPdf, exportToExcel } from "@/lib/reportExport"
import type { FinanceTransaction } from "@/types/finance"

interface FinancialReportTabProps {
  transactions: FinanceTransaction[]
  period: { start: string; end: string }
  periodLabel: string
}

export function FinancialReportTab({ transactions, period, periodLabel }: FinancialReportTabProps) {
  const { t } = useTranslation()
  const inPeriod = transactions.filter((tr) => inRange(tr.date, period.start, period.end))
  const { totalRecettes, totalDepenses, marge } = computeTotals(inPeriod)

  const columns: DataTableColumn<FinanceTransaction>[] = [
    { key: "date", label: t("rapports.colDate"), render: (tr) => formatDate(tr.date) },
    { key: "type", label: t("rapports.financial.colType"), render: (tr) => t(tr.type === "recette" ? "finance.transactions.typeRevenue" : "finance.transactions.typeExpense") },
    { key: "categorie", label: t("rapports.financial.colCategory"), render: (tr) => tr.categorie },
    { key: "description", label: t("rapports.financial.colDescription"), render: (tr) => tr.description },
    { key: "montant", label: t("rapports.financial.colAmount"), render: (tr) => formatCurrency(tr.montant) },
  ]

  function handleExportPdf() {
    exportToPdf(
      t("rapports.financial.title"),
      periodLabel,
      [t("rapports.colDate"), t("rapports.financial.colType"), t("rapports.financial.colCategory"), t("rapports.financial.colDescription"), t("rapports.financial.colAmount")],
      inPeriod.map((tr) => [formatDate(tr.date), t(tr.type === "recette" ? "finance.transactions.typeRevenue" : "finance.transactions.typeExpense"), tr.categorie, tr.description, formatCurrency(tr.montant)]),
      `rapport-financier-${period.start}.pdf`
    )
  }

  function handleExportExcel() {
    exportToExcel(
      t("rapports.financial.title"),
      [t("rapports.colDate"), t("rapports.financial.colType"), t("rapports.financial.colCategory"), t("rapports.financial.colDescription"), t("rapports.financial.colAmount")],
      inPeriod.map((tr) => [tr.date, tr.type, tr.categorie, tr.description, tr.montant]),
      `rapport-financier-${period.start}.xlsx`
    )
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={TrendingUp} label={t("rapports.financial.statRevenue")} value={formatCurrency(totalRecettes)} tone="success" />
        <StatCard icon={TrendingDown} label={t("rapports.financial.statExpenses")} value={formatCurrency(totalDepenses)} tone="destructive" />
        <StatCard icon={Wallet} label={t("rapports.financial.statMargin")} value={formatCurrency(marge)} tone={marge >= 0 ? "success" : "destructive"} />
      </div>

      <div className="mb-3 flex justify-end gap-2">
        <Button variant="outline" onClick={handleExportExcel} className="gap-2">
          <Sheet className="h-4 w-4" />
          {t("rapports.exportExcel")}
        </Button>
        <Button variant="outline" onClick={handleExportPdf} className="gap-2">
          <FileDown className="h-4 w-4" />
          {t("rapports.exportPdf")}
        </Button>
      </div>

      <DataTable columns={columns} rows={inPeriod} rowKey={(tr) => tr.id} isLoading={false} emptyIcon={Wallet} emptyTitle={t("rapports.emptyTitle")} emptyDescription={t("rapports.emptyDescription")} />
    </div>
  )
}
