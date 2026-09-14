import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { FileDown, Sheet, HandCoins, Users, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { usePersonnelStore } from "@/features/personnel/personnelStore"
import { usePayrollSettingsStore } from "@/features/personnel/payrollSettingsStore"
import { buildRetenues, payrollWindow, type RetenueLine } from "@/lib/personnelCalc"
import { currentIsoDate } from "@/lib/dateRange"
import { formatCurrency, formatDate } from "@/lib/format"
import { exportToPdf, exportToExcel } from "@/lib/reportExport"
import type { Invoice } from "@/types/invoice"
import type { StockArticle } from "@/types/stock"

interface PayrollDeductionReportTabProps {
  invoices: Invoice[]
  articles: StockArticle[]
}

interface GroupTotal {
  cle: string
  montant: number
  lignes: number
}

function groupTotals(lines: RetenueLine[], key: (line: RetenueLine) => string): GroupTotal[] {
  const totals = new Map<string, GroupTotal>()
  for (const line of lines) {
    const cle = key(line) || "—"
    const total = totals.get(cle) ?? { cle, montant: 0, lignes: 0 }
    total.montant += line.reste
    total.lignes += 1
    totals.set(cle, total)
  }
  return [...totals.values()].sort((a, b) => b.montant - a.montant)
}

function TotalsCard({ title, rows }: { title: string; rows: GroupTotal[] }) {
  if (rows.length === 0) return null
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="mb-3 text-sm font-semibold text-foreground">{title}</p>
      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <li key={row.cle} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-foreground">{row.cle}</span>
            <span className="text-muted-foreground">{formatCurrency(row.montant)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PayrollDeductionReportTab({ invoices, articles }: PayrollDeductionReportTabProps) {
  const { t } = useTranslation()
  const { employes, fetchAll: fetchEmployes } = usePersonnelStore()
  const { jourDebut, jourFin } = usePayrollSettingsStore()
  const defaultClosing = payrollWindow(currentIsoDate(), jourDebut, jourFin).end
  const [closingDate, setClosingDate] = useState(defaultClosing)

  useEffect(() => {
    fetchEmployes()
  }, [fetchEmployes])

  const employeById = useMemo(() => new Map(employes.map((e) => [e.id, e])), [employes])

  // Everything still owed on the closing date, whatever month the sale happened in.
  const lines = useMemo(
    () =>
      buildRetenues(invoices, employes, (id) => articles.find((a) => a.id === id)?.nom).filter(
        (line) => line.statut === "en_attente" && line.date <= closingDate
      ),
    [invoices, employes, articles, closingDate]
  )

  const total = lines.reduce((sum, line) => sum + line.reste, 0)
  const parProduit = groupTotals(lines, (line) => line.produit)
  const parDepartement = groupTotals(lines, (line) => employeById.get(line.employeId)?.departement ?? "")
  const parEmploye = groupTotals(lines, (line) => employeById.get(line.employeId)?.nom ?? "")

  function employeName(id: string): string {
    return employeById.get(id)?.nom ?? "—"
  }
  function departement(id: string): string {
    return employeById.get(id)?.departement ?? "—"
  }

  const columns: DataTableColumn<RetenueLine>[] = [
    { key: "date", label: t("rapports.colDate"), render: (line) => formatDate(line.date) },
    { key: "employe", label: t("personnel.colEmploye"), render: (line) => employeName(line.employeId) },
    { key: "departement", label: t("personnel.fieldDepartment"), render: (line) => <StatusBadge label={departement(line.employeId)} tone="info" /> },
    { key: "produit", label: t("personnel.colProduct"), render: (line) => line.produit || <span className="text-muted-foreground">—</span> },
    { key: "numero", label: t("clients.invoices.colNumber"), render: (line) => line.numero },
    { key: "reste", label: t("rapports.payroll.colAmount"), render: (line) => formatCurrency(line.reste) },
  ]

  const exportColumns = [
    t("rapports.colDate"),
    t("personnel.colEmploye"),
    t("personnel.fieldDepartment"),
    t("personnel.colProduct"),
    t("clients.invoices.colNumber"),
    t("rapports.payroll.colAmount"),
  ]

  function handleExportPdf() {
    exportToPdf(
      t("rapports.payroll.title"),
      t("rapports.payroll.closingSummary", { date: formatDate(closingDate) }),
      exportColumns,
      lines.map((line) => [formatDate(line.date), employeName(line.employeId), departement(line.employeId), line.produit, line.numero, formatCurrency(line.reste)]),
      `retenues-sur-salaire-${closingDate}.pdf`
    )
  }

  function handleExportExcel() {
    exportToExcel(
      t("rapports.payroll.title"),
      exportColumns,
      lines.map((line) => [line.date, employeName(line.employeId), departement(line.employeId), line.produit, line.numero, line.reste]),
      `retenues-sur-salaire-${closingDate}.xlsx`
    )
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={HandCoins} label={t("rapports.payroll.statTotal")} value={formatCurrency(total)} tone={total > 0 ? "warning" : "success"} />
        <StatCard icon={Users} label={t("rapports.payroll.statStaff")} value={String(parEmploye.length)} tone="info" />
        <StatCard icon={Package} label={t("rapports.payroll.statProducts")} value={String(parProduit.length)} tone="primary" />
      </div>

      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Label htmlFor="closing-date">{t("rapports.payroll.fieldClosingDate")}</Label>
          <input
            id="closing-date"
            type="date"
            value={closingDate}
            onChange={(e) => e.target.value && setClosingDate(e.target.value)}
            className="mt-1.5 h-9 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-muted-foreground">{t("rapports.payroll.closingHint")}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel} className="gap-2">
            <Sheet className="h-4 w-4" />
            {t("rapports.exportExcel")}
          </Button>
          <Button variant="outline" onClick={handleExportPdf} className="gap-2">
            <FileDown className="h-4 w-4" />
            {t("rapports.exportPdf")}
          </Button>
        </div>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <TotalsCard title={t("rapports.payroll.byProduct")} rows={parProduit} />
        <TotalsCard title={t("rapports.payroll.byDepartment")} rows={parDepartement} />
      </div>

      <DataTable
        columns={columns}
        rows={lines}
        rowKey={(line) => line.invoiceId}
        emptyIcon={HandCoins}
        emptyTitle={t("rapports.payroll.emptyTitle")}
        emptyDescription={t("rapports.payroll.emptyDescription")}
      />
    </div>
  )
}
