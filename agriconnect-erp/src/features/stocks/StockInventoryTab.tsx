import { useMemo, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { Plus, Package, AlertTriangle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { QuickAddDialog, type FieldConfig } from "@/components/shared/QuickAddDialog"
import { StockStatusBadge } from "@/components/shared/StockStatusBadge"
import { useStockStore } from "./stockStore"
import { computeCurrentStock, getStockStatus, type StockStatus } from "@/lib/stockCalc"
import { formatNumber } from "@/lib/format"

const articleSchema = z.object({
  nom: z.string().min(2, "Minimum 2 caractères"),
  unite: z.string().min(1, "Unité requise (ex: kg, litres, unités)"),
  description: z.string().optional(),
  quantiteInitiale: z.number({ invalid_type_error: "Nombre requis" }).min(0),
  seuilCritique: z.number({ invalid_type_error: "Nombre requis" }).min(0),
})
type ArticleFormValues = z.infer<typeof articleSchema>

const articleFields: FieldConfig<ArticleFormValues>[] = [
  { type: "text", name: "nom", label: "Nom de l'article", placeholder: "Ex: Farine de maïs" },
  { type: "text", name: "unite", label: "Unité", placeholder: "kg, litres, unités..." },
  { type: "number", name: "quantiteInitiale", label: "Quantité de départ" },
  { type: "number", name: "seuilCritique", label: "Seuil critique" },
]

const PROGRESS_COLOR: Record<StockStatus, string> = {
  ok: "bg-success",
  bas: "bg-warning",
  critique: "bg-destructive",
}

interface StockInventoryTabProps {
  onGoToAlerts: () => void
}

export function StockInventoryTab({ onGoToAlerts }: StockInventoryTabProps) {
  const { articles, movements, isLoading, addArticle } = useStockStore()
  const [articleOpen, setArticleOpen] = useState(false)

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
    { key: "nom", label: "Article", render: (row) => row.article.nom },
    {
      key: "quantite",
      label: "Quantité",
      render: (row) => `${formatNumber(row.current)} / seuil ${formatNumber(row.article.seuilCritique)} ${row.article.unite}`,
    },
    {
      key: "progression",
      label: "Progression",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full transition-all duration-500 ${PROGRESS_COLOR[row.status]}`} style={{ width: `${row.progressPercent}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{Math.round(row.progressPercent)}%</span>
        </div>
      ),
    },
    { key: "statut", label: "Statut", render: (row) => <StockStatusBadge status={row.status} /> },
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Package} label="Articles suivis" value={formatNumber(articles.length)} tone="primary" />
        <button type="button" onClick={onGoToAlerts} className="text-left">
          <StatCard icon={AlertTriangle} label="Alertes critiques" value={formatNumber(critiqueCount)} tone={critiqueCount > 0 ? "destructive" : "success"} />
        </button>
        <button type="button" onClick={onGoToAlerts} className="text-left">
          <StatCard icon={AlertCircle} label="Alertes stock bas" value={formatNumber(basCount)} tone={basCount > 0 ? "warning" : "success"} />
        </button>
      </div>

      <div className="mb-3 flex justify-end">
        <Button variant="outline" onClick={() => setArticleOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvel article
        </Button>
      </div>

      <DataTable columns={columns} rows={rows} rowKey={(row) => row.article.id} isLoading={isLoading} emptyIcon={Package} emptyTitle="Aucun article" />

      <QuickAddDialog
        open={articleOpen}
        onOpenChange={setArticleOpen}
        title="Nouvel article de stock"
        schema={articleSchema}
        fields={articleFields}
        defaultValues={{ nom: "", unite: "", quantiteInitiale: 0, seuilCritique: 0 }}
        onSubmit={async (values) => {
          addArticle(values)
          toast.success("Article créé")
        }}
      />
    </div>
  )
}