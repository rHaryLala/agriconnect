import { useTranslation } from "react-i18next"
import { FileDown, Sheet, Sprout } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { buildProductionRows, type ProductionRow } from "@/lib/reportsCalc"
import { formatNumber } from "@/lib/format"
import { exportToPdf, exportToExcel } from "@/lib/reportExport"
import type { PouleEntry, VacheEntry, KuroilerEntry, CultureEntry, BovinAnimal, PoulardMouvement, RizRecolte, RizVente, HaricotMouvement } from "@/types/production"

interface ProductionReportTabProps {
  period: { start: string; end: string }
  periodLabel: string
  poules: PouleEntry[]
  vaches: VacheEntry[]
  kuroiler: KuroilerEntry[]
  cultures: CultureEntry[]
  bovins: BovinAnimal[]
  poulard: PoulardMouvement[]
  rizRecoltes: RizRecolte[]
  rizVentes: RizVente[]
  haricots: HaricotMouvement[]
}

export function ProductionReportTab(props: ProductionReportTabProps) {
  const { t } = useTranslation()
  const rows = buildProductionRows(props.period, props, t)

  const columns: DataTableColumn<ProductionRow>[] = [
    { key: "filiere", label: t("rapports.production.colFiliere"), render: (r) => r.filiere },
    { key: "indicateur", label: t("rapports.production.colIndicator"), render: (r) => r.indicateur },
    { key: "valeur", label: t("rapports.production.colValue"), render: (r) => `${formatNumber(r.valeur)} ${r.unite}` },
  ]

  function handleExportPdf() {
    exportToPdf(
      t("rapports.production.title"),
      props.periodLabel,
      [t("rapports.production.colFiliere"), t("rapports.production.colIndicator"), t("rapports.production.colValue")],
      rows.map((r) => [r.filiere, r.indicateur, `${formatNumber(r.valeur)} ${r.unite}`]),
      `rapport-production-${props.period.start}.pdf`
    )
  }

  function handleExportExcel() {
    exportToExcel(
      t("rapports.production.title"),
      [t("rapports.production.colFiliere"), t("rapports.production.colIndicator"), t("rapports.production.colValue"), t("rapports.production.colUnit")],
      rows.map((r) => [r.filiere, r.indicateur, r.valeur, r.unite]),
      `rapport-production-${props.period.start}.xlsx`
    )
  }

  return (
    <div>
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

      <DataTable columns={columns} rows={rows} rowKey={(r) => `${r.filiere}-${r.indicateur}`} isLoading={false} emptyIcon={Sprout} emptyTitle={t("rapports.emptyTitle")} emptyDescription={t("rapports.emptyDescription")} />
    </div>
  )
}
