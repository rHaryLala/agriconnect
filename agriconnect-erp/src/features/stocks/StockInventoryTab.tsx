import { useMemo, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { useTranslation } from "react-i18next"
import { Plus, Package, AlertTriangle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { QuickAddDialog, type FieldConfig } from "@/components/shared/QuickAddDialog"
import { StockStatusBadge } from "@/components/shared/StockStatusBadge"
import { useStockStore } from "./stockStore"
import { computeCurrentStock, getStockStatus, type StockStatus } from "@/lib/stockCalc"
import { formatNumber } from "@/lib/format"

type ArticleFormValues = { nom: string; unite: string; quantiteInitiale: number; seuilCritique: number }

function buildArticleSchema(t: (key: string) => string) {
  return z.object({
    nom: z.string().min(2, t("stock.inventory.validationName")),
    unite: z.string().min(1, t("stock.inventory.validationUnit")),
    quantiteInitiale: z.number({ error: t("stock.inventory.validationNumber") }).min(0),
    seuilCritique: z.number({ error: t("stock.inventory.validationNumber") }).min(0),
  })
}

const PROGRESS_COLOR: Record<StockStatus, string> = { ok: "bg-success", bas: "bg-warning", critique: "bg-destructive" }

interface StockInventoryTabProps {
  onGoToAlerts: () => void
}

export function StockInventoryTab({ onGoToAlerts }: StockInventoryTabProps) {
  const { t } = useTranslation()
  const { articles, movements, isLoading, addArticle } = useStockStore()
  const [articleOpen, setArticleOpen] = useState(false)

  const articleSchema = useMemo(() => buildArticleSchema(t), [t])
  const articleFields: FieldConfig<ArticleFormValues>[] = useMemo(
    () => [
      { type: "text", name: "nom", label: t("stock.inventory.fieldName"), placeholder: t("stock.inventory.fieldNamePlaceholder") },
      { type: "text", name: "unite", label: t("stock.inventory.fieldUnit"), placeholder: t("stock.inventory.fieldUnitPlaceholder") },
      { type: "number", name: "quantiteInitiale", label: t("stock.inventory.fieldInitialQty") },
      { type: "number", name: "seuilCritique", label: t("stock.inventory.fieldThreshold") },
    ],
    [t]
  )

  const rows = useMemo(
    () =>
      articles.map((a) => {
        const current = computeCurrentStock(a, movements)
        const status = getStockStatus(current, a.seuilCritique)
        const progressPercent = Math.min((current / (a.seuilCritique * 3 || 1)) * 100, 100)
        return { article: a, current, status, progressPercent }
      }),
    [articles, movements]
  )

  const critiqueCount = rows.filter((r) => r.status === "critique").length
  const basCount = rows.filter((r) => r.status === "bas").length

  const columns: DataTableColumn<(typeof rows)[number]>[] = [
    { key: "nom", label: t("stock.inventory.colArticle"), render: (row) => row.article.nom },
    {
      key: "quantite",
      label: t("stock.inventory.colQuantity"),
      render: (row) => `${formatNumber(row.current)} / ${t("stock.inventory.thresholdSuffix")} ${formatNumber(row.article.seuilCritique)} ${row.article.unite}`,
    },
    {
      key: "progression",
      label: t("stock.inventory.colProgress"),
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full transition-all duration-500 ${PROGRESS_COLOR[row.status]}`} style={{ width: `${row.progressPercent}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{Math.round(row.progressPercent)}%</span>
        </div>
      ),
    },
    { key: "statut", label: t("stock.inventory.colStatus"), render: (row) => <StockStatusBadge status={row.status} /> },
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Package} label={t("stock.inventory.statArticles")} value={formatNumber(articles.length)} tone="primary" />
        <button type="button" onClick={onGoToAlerts} className="text-left">
          <StatCard icon={AlertTriangle} label={t("stock.inventory.statCritical")} value={formatNumber(critiqueCount)} tone={critiqueCount > 0 ? "destructive" : "success"} />
        </button>
        <button type="button" onClick={onGoToAlerts} className="text-left">
          <StatCard icon={AlertCircle} label={t("stock.inventory.statLow")} value={formatNumber(basCount)} tone={basCount > 0 ? "warning" : "success"} />
        </button>
      </div>

      <div className="mb-3 flex justify-end">
        <Button variant="outline" onClick={() => setArticleOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("stock.inventory.newArticle")}
        </Button>
      </div>

      <DataTable columns={columns} rows={rows} rowKey={(row) => row.article.id} isLoading={isLoading} emptyIcon={Package} emptyTitle={t("stock.inventory.emptyTitle")} />

      <QuickAddDialog
        open={articleOpen}
        onOpenChange={setArticleOpen}
        title={t("stock.inventory.dialogTitle")}
        schema={articleSchema}
        fields={articleFields}
        defaultValues={{ nom: "", unite: "", quantiteInitiale: 0, seuilCritique: 0 }}
        onSubmit={async (values) => {
          addArticle(values)
          toast.success(t("stock.inventory.toastCreated"))
        }}
      />
    </div>
  )
}