import { useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Pencil, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { StockMovementDialog } from "./StockMovementDialog"
import { useStockStore } from "./stockStore"
import { computeCurrentStock, computeReceptionEcart, computeRunningBalances } from "@/lib/stockCalc"
import { formatDate, formatNumber } from "@/lib/format"
import type { RowTone } from "@/lib/alerts"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { STOCK_LOCATIONS, type MovementType, type StockLocation, type StockMovement } from "@/types/stock"
import { STOCK_LOCATION_LABEL_KEYS, STOCK_LOCATION_TONES } from "./stockLabels"
import { ConfirmDeleteButton } from "@/components/shared/ConfirmDeleteButton"

const MOVEMENT_TYPE_LABEL_KEYS: Record<MovementType, string> = {
  entree: "stock.movements.typeEntry",
  sortie: "stock.movements.typeExit",
  transfert: "stock.movements.typeTransfer",
}

const MOVEMENT_TYPE_CLASS: Record<MovementType, string> = {
  entree: "text-success",
  sortie: "text-destructive",
  transfert: "text-info",
}

function isWithinLastDays(dateStr: string, days: number): boolean {
  const diff = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  return diff <= days
}

interface StockMovementsTabProps {
  canEdit: boolean
}

export function StockMovementsTab({ canEdit }: StockMovementsTabProps) {
  const { t } = useTranslation()
  const { articles, movements, isLoading, addMovement, updateMovement, deleteMovement } = useStockStore()
  const [movementOpen, setMovementOpen] = useState(false)
  const [editingMovement, setEditingMovement] = useState<StockMovement | null>(null)
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")
  const [locationFilter, setLocationFilter] = useState<StockLocation | "tous">("tous")

  const runningBalances = useMemo(() => {
    const merged: Record<string, number> = {}
    articles.forEach((a) => {
      STOCK_LOCATIONS.forEach((location) => Object.assign(merged, computeRunningBalances(a, movements, location)))
    })
    return merged
  }, [articles, movements])

  const entrees7j = movements.filter((m) => m.type === "entree" && isWithinLastDays(m.date, 7)).length
  const sorties7j = movements.filter((m) => m.type === "sortie" && isWithinLastDays(m.date, 7)).length

  const filtered = useMemo(
    () =>
      movements.filter((m) => {
        if (locationFilter !== "tous" && m.emplacement !== locationFilter) return false
        if (dateDebut && m.date < dateDebut) return false
        if (dateFin && m.date > dateFin) return false
        return true
      }),
    [movements, dateDebut, dateFin, locationFilter]
  )

  function openCreate() {
    setEditingMovement(null)
    setMovementOpen(true)
  }
  function openEdit(m: StockMovement) {
    setEditingMovement(m)
    setMovementOpen(true)
  }

  async function handleSubmit(values: Omit<StockMovement, "id">) {
    if (values.type === "sortie") {
      const article = articles.find((a) => a.id === values.articleId)
      if (article) {
        const current = computeCurrentStock(article, movements.filter((m) => m.id !== editingMovement?.id), values.emplacement)
        if (values.quantite > current) {
          toast.error(t("stock.movements.insufficientStockAtLocation", { name: article.nom, amount: current, unit: article.unite, location: t(STOCK_LOCATION_LABEL_KEYS[values.emplacement]) }))
          return
        }
      }
    }
    if (editingMovement) {
      await updateMovement(editingMovement.id, values)
      toast.success(t("stock.movements.toastModified"))
    } else {
      await addMovement(values)
      toast.success(t("stock.movements.toastCreated"))
    }
  }

  function rowTone(m: StockMovement): RowTone {
    const balance = runningBalances[m.id]
    return balance !== undefined && balance < 0 ? "critical" : null
  }

  const columns: DataTableColumn<StockMovement>[] = [
    { key: "date", label: t("stock.movements.colDate"), render: (m) => formatDate(m.date) },
    { key: "article", label: t("stock.movements.colArticle"), render: (m) => articles.find((a) => a.id === m.articleId)?.nom ?? "—" },
    {
      key: "type",
      label: t("stock.movements.colType"),
      render: (m) => (
        <span className={`inline-flex items-center gap-1.5 text-sm ${MOVEMENT_TYPE_CLASS[m.type]}`}>
          {m.type === "entree" ? <ArrowDownCircle className="h-4 w-4" /> : m.type === "sortie" ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowLeftRight className="h-4 w-4" />}
          {t(MOVEMENT_TYPE_LABEL_KEYS[m.type])}
        </span>
      ),
    },
    {
      key: "emplacement",
      label: t("stock.movements.colLocation"),
      render: (m) => (
        <span className="inline-flex items-center gap-1.5">
          <StatusBadge label={t(STOCK_LOCATION_LABEL_KEYS[m.emplacement])} tone={STOCK_LOCATION_TONES[m.emplacement]} />
          {m.emplacementDestination && (
            <>
              <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
              <StatusBadge label={t(STOCK_LOCATION_LABEL_KEYS[m.emplacementDestination])} tone={STOCK_LOCATION_TONES[m.emplacementDestination]} />
            </>
          )}
        </span>
      ),
    },
    { key: "quantite", label: t("stock.movements.colQuantity"), render: (m) => formatNumber(m.quantite) },
    {
      key: "ecart",
      label: t("stock.movements.colGap"),
      render: (m) => {
        const ecart = computeReceptionEcart(m)
        if (ecart === null) return <span className="text-muted-foreground">—</span>
        if (ecart === 0) return <StatusBadge label={t("stock.movements.gapNone")} tone="success" />
        return <StatusBadge label={ecart > 0 ? `+${formatNumber(ecart)}` : formatNumber(ecart)} tone="warning" />
      },
    },
    { key: "destinataire", label: t("stock.movements.colRecipient"), render: (m) => m.destinataire || <span className="text-muted-foreground">—</span> },
    {
      key: "reste",
      label: t("stock.movements.colRemaining"),
      render: (m) => {
        const article = articles.find((a) => a.id === m.articleId)
        const balance = runningBalances[m.id]
        return balance !== undefined && article ? `${formatNumber(balance)} ${article.unite}` : "—"
      },
    },
    ...(canEdit
      ? [{
          key: "actions",
          label: "",
          className: "text-right",
          sticky: true,
          render: (m: StockMovement) => (
            <div className="flex justify-end gap-1">
              {m.type !== "transfert" && (
                <Button variant="ghost" size="icon" onClick={() => openEdit(m)} aria-label={t("common.edit")}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <ConfirmDeleteButton onConfirm={() => { deleteMovement(m.id); toast.success(t("stock.movements.toastDeleted")) }} />
            </div>
          ),
        } as DataTableColumn<StockMovement>]
      : []),
  ]

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground">{movements.length} {t("stock.movements.pillTotal")}</span>
        <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">↓ {entrees7j} {t("stock.movements.pillEntries")}</span>
        <span className="rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive">↑ {sorties7j} {t("stock.movements.pillExits")}</span>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1">
          {(["tous", ...STOCK_LOCATIONS] as const).map((f) => (
            <button
              key={f} type="button" onClick={() => setLocationFilter(f)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-200 ${locationFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f === "tous" ? t("stock.locations.all") : t(STOCK_LOCATION_LABEL_KEYS[f])}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5">
          <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="bg-transparent text-sm text-foreground outline-none" />
          <span className="text-xs text-muted-foreground">→</span>
          <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="bg-transparent text-sm text-foreground outline-none" />
          {(dateDebut || dateFin) && (
            <button type="button" onClick={() => { setDateDebut(""); setDateFin("") }} aria-label={t("common.close")} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {canEdit && (
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("stock.movements.newMovement")}
          </Button>
        )}
      </div>

      <DataTable columns={columns} rows={filtered} rowKey={(m) => m.id} isLoading={isLoading} emptyIcon={ArrowDownCircle} emptyTitle={t("stock.movements.emptyTitle")} rowTone={rowTone} />

      {canEdit && (
        <StockMovementDialog open={movementOpen} onOpenChange={setMovementOpen} articles={articles} editingEntry={editingMovement} onSubmit={handleSubmit} />
      )}
    </div>
  )
}
