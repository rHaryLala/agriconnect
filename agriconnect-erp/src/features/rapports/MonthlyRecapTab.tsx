import { useTranslation } from "react-i18next"
import { FileDown, Sheet, ClipboardList, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { buildMonthlyRecapRows, computeInvoiceRecap, inRange, type MonthlyRecapRow } from "@/lib/reportsCalc"
import { totalOeufs } from "@/lib/eggCalc"
import { computeInvoiceTotal } from "@/types/invoice"
import { formatCurrency, formatNumber } from "@/lib/format"
import { exportToPdf, exportToExcel } from "@/lib/reportExport"
import type { BovinAnimal, PoulardMouvement, RizVente, HaricotMouvement } from "@/types/production"
import type { EggSale } from "@/types/eggSale"
import type { Invoice } from "@/types/invoice"

interface MonthlyRecapTabProps {
  period: { start: string; end: string }
  periodLabel: string
  eggSales: EggSale[]
  eggPrices: Record<string, number>
  bovins: BovinAnimal[]
  poulard: PoulardMouvement[]
  rizVentes: RizVente[]
  haricots: HaricotMouvement[]
  invoices: Invoice[]
}

export function MonthlyRecapTab({ period, periodLabel, eggSales, eggPrices, bovins, poulard, rizVentes, haricots, invoices }: MonthlyRecapTabProps) {
  const { t } = useTranslation()

  const eggSalesInPeriod = eggSales.filter((s) => inRange(s.date, period.start, period.end))
  const eggQuantite = eggSalesInPeriod.reduce((sum, s) => sum + totalOeufs(s.quantities), 0)
  const eggMontant = eggSalesInPeriod.reduce((sum, s) => sum + Object.entries(s.quantities).reduce((sub, [cat, qty]) => sub + qty * (eggPrices[cat] ?? 0), 0), 0)

  const rows = buildMonthlyRecapRows(period, {
    eggSalesValue: { quantite: eggQuantite, montant: eggMontant },
    bovins,
    poulard,
    rizVentes,
    haricots,
  })

  const invoiceRecap = computeInvoiceRecap(invoices, period.start, period.end, computeInvoiceTotal)

  const columns: DataTableColumn<MonthlyRecapRow>[] = [
    { key: "filiere", label: t("rapports.recap.colFiliere"), render: (r) => r.filiere },
    { key: "quantite", label: t("rapports.recap.colQuantitySold"), render: (r) => `${formatNumber(r.quantiteVendue)} ${r.unite}` },
    { key: "montant", label: t("rapports.recap.colAmount"), render: (r) => formatCurrency(r.montant) },
  ]

  function handleExportPdf() {
    exportToPdf(
      t("rapports.recap.title"),
      periodLabel,
      [t("rapports.recap.colFiliere"), t("rapports.recap.colQuantitySold"), t("rapports.recap.colAmount")],
      rows.map((r) => [r.filiere, `${formatNumber(r.quantiteVendue)} ${r.unite}`, formatCurrency(r.montant)]),
      `recap-mensuel-${period.start}.pdf`
    )
  }

  function handleExportExcel() {
    exportToExcel(
      t("rapports.recap.title"),
      [t("rapports.recap.colFiliere"), t("rapports.recap.colQuantitySold"), "Unité", t("rapports.recap.colAmount")],
      rows.map((r) => [r.filiere, r.quantiteVendue, r.unite, r.montant]),
      `recap-mensuel-${period.start}.xlsx`
    )
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Wallet} label={t("rapports.recap.statInvoiced")} value={formatCurrency(invoiceRecap.facture)} tone="info" />
        <StatCard icon={Wallet} label={t("rapports.recap.statCollected")} value={formatCurrency(invoiceRecap.encaisse)} tone="success" />
        <StatCard icon={Wallet} label={t("rapports.recap.statOutstanding")} value={formatCurrency(invoiceRecap.restant)} tone="warning" />
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

      <DataTable columns={columns} rows={rows} rowKey={(r) => r.filiere} isLoading={false} emptyIcon={ClipboardList} emptyTitle={t("rapports.emptyTitle")} emptyDescription={t("rapports.emptyDescription")} />
    </div>
  )
}
