import { useTranslation } from "react-i18next"
import { FileDown, Sheet, Package, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { computeCurrentStock, getStockStatus } from "@/lib/stockCalc"
import { inRange } from "@/lib/reportsCalc"
import { formatDate, formatNumber } from "@/lib/format"
import { exportToPdf, exportToExcel } from "@/lib/reportExport"
import type { StockArticle, StockMovement } from "@/types/stock"

interface StockReportTabProps {
  articles: StockArticle[]
  movements: StockMovement[]
  period: { start: string; end: string }
  periodLabel: string
}

interface InventoryRow {
  article: StockArticle
  current: number
  status: ReturnType<typeof getStockStatus>
}

export function StockReportTab({ articles, movements, period, periodLabel }: StockReportTabProps) {
  const { t } = useTranslation()
  const inventory: InventoryRow[] = articles.map((article) => {
    const current = computeCurrentStock(article, movements)
    return { article, current, status: getStockStatus(current, article.seuilCritique) }
  })
  const critical = inventory.filter((r) => r.status === "critique")
  const movementsInPeriod = movements.filter((m) => inRange(m.date, period.start, period.end))

  const statusLabel = (s: ReturnType<typeof getStockStatus>) => t(s === "critique" ? "stock.status.critical" : s === "bas" ? "stock.status.low" : "stock.status.ok")

  const inventoryColumns: DataTableColumn<InventoryRow>[] = [
    { key: "article", label: t("rapports.stock.colArticle"), render: (r) => `${r.article.nom} (${r.article.unite})` },
    { key: "current", label: t("rapports.stock.colCurrentLevel"), render: (r) => formatNumber(r.current) },
    { key: "seuil", label: t("rapports.stock.colThreshold"), render: (r) => formatNumber(r.article.seuilCritique) },
    { key: "status", label: t("rapports.stock.colStatus"), render: (r) => <StatusBadge label={statusLabel(r.status)} tone={r.status === "critique" ? "destructive" : r.status === "bas" ? "warning" : "success"} /> },
  ]

  function articleName(id: string): string {
    return articles.find((a) => a.id === id)?.nom ?? "—"
  }

  const movementColumns: DataTableColumn<StockMovement>[] = [
    { key: "date", label: t("rapports.colDate"), render: (m) => formatDate(m.date) },
    { key: "article", label: t("rapports.stock.colArticle"), render: (m) => articleName(m.articleId) },
    { key: "type", label: t("stock.movements.fieldType"), render: (m) => t(m.type === "entree" ? "stock.movements.typeEntry" : "stock.movements.typeExit") },
    { key: "quantite", label: t("stock.movements.fieldQuantity"), render: (m) => formatNumber(m.quantite) },
  ]

  function handleExportPdf() {
    exportToPdf(
      t("rapports.stock.title"),
      periodLabel,
      [t("rapports.stock.colArticle"), t("rapports.stock.colCurrentLevel"), t("rapports.stock.colThreshold"), t("rapports.stock.colStatus")],
      inventory.map((r) => [r.article.nom, formatNumber(r.current), formatNumber(r.article.seuilCritique), statusLabel(r.status)]),
      `rapport-stock-${period.start}.pdf`
    )
  }

  function handleExportExcel() {
    exportToExcel(
      t("rapports.stock.title"),
      [t("rapports.stock.colArticle"), t("rapports.stock.colCurrentLevel"), t("rapports.stock.colThreshold"), t("rapports.stock.colStatus")],
      inventory.map((r) => [r.article.nom, r.current, r.article.seuilCritique, statusLabel(r.status)]),
      `rapport-stock-${period.start}.xlsx`
    )
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Package} label={t("rapports.stock.statArticles")} value={formatNumber(articles.length)} tone="primary" />
        <StatCard icon={AlertTriangle} label={t("rapports.stock.statCritical")} value={formatNumber(critical.length)} tone="destructive" />
        <StatCard icon={Package} label={t("rapports.stock.statMovements")} value={formatNumber(movementsInPeriod.length)} tone="info" />
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

      <p className="mb-2 text-sm font-semibold text-foreground">{t("rapports.stock.sectionInventory")}</p>
      <DataTable columns={inventoryColumns} rows={inventory} rowKey={(r) => r.article.id} isLoading={false} emptyIcon={Package} emptyTitle={t("rapports.emptyTitle")} emptyDescription={t("rapports.emptyDescription")} />

      <p className="mt-6 mb-2 text-sm font-semibold text-foreground">{t("rapports.stock.sectionMovements")}</p>
      <DataTable columns={movementColumns} rows={movementsInPeriod} rowKey={(m) => m.id} isLoading={false} emptyIcon={Package} emptyTitle={t("rapports.emptyTitle")} emptyDescription={t("rapports.emptyDescription")} />
    </div>
  )
}
