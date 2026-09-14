import { useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { Plus, ArrowLeftRight, Pencil, Trash2, HandCoins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { QuickAddDialog, type FieldConfig } from "@/components/shared/QuickAddDialog"
import { StockTransferDialog } from "./StockTransferDialog"
import { useStockStore } from "./stockStore"
import { STOCK_LOCATION_LABEL_KEYS } from "./stockLabels"
import { computeCurrentStock, computeLocationDebts, computeTransferDue } from "@/lib/stockCalc"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import type { StockMovement } from "@/types/stock"

type SettlementValues = { montant: number }

export function StockTransfersTab({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation()
  const { articles, movements, isLoading, addMovement, updateMovement, deleteMovement } = useStockStore()
  const [transferOpen, setTransferOpen] = useState(false)
  const [editingTransfer, setEditingTransfer] = useState<StockMovement | null>(null)
  const [settlingTransfer, setSettlingTransfer] = useState<StockMovement | null>(null)

  const transfers = useMemo(() => movements.filter((m) => m.type === "transfert"), [movements])
  const debts = useMemo(() => computeLocationDebts(movements), [movements])
  const totalDue = debts.reduce((sum, d) => sum + d.reste, 0)
  const totalTransferred = debts.reduce((sum, d) => sum + d.montant, 0)

  const settlementSchema = useMemo(
    () =>
      z.object({
        montant: z
          .number({ error: t("stock.inventory.validationNumber") })
          .positive(t("stock.transfers.validationSettlementAmount"))
          .max(settlingTransfer ? computeTransferDue(settlingTransfer) : 0, t("stock.transfers.validationSettlementExceedsDue")),
      }),
    [t, settlingTransfer]
  )
  const settlementFields: FieldConfig<SettlementValues>[] = useMemo(
    () => [{ type: "number", name: "montant", label: t("stock.transfers.fieldSettlementAmount") }],
    [t]
  )

  function openCreate() {
    setEditingTransfer(null)
    setTransferOpen(true)
  }
  function openEdit(movement: StockMovement) {
    setEditingTransfer(movement)
    setTransferOpen(true)
  }

  async function handleSubmit(values: Omit<StockMovement, "id">) {
    const article = articles.find((a) => a.id === values.articleId)
    if (article) {
      const available = computeCurrentStock(article, movements.filter((m) => m.id !== editingTransfer?.id), values.emplacement)
      if (values.quantite > available) {
        toast.error(
          t("stock.movements.insufficientStockAtLocation", {
            name: article.nom,
            amount: available,
            unit: article.unite,
            location: t(STOCK_LOCATION_LABEL_KEYS[values.emplacement]),
          })
        )
        return
      }
    }
    if (editingTransfer) {
      await updateMovement(editingTransfer.id, values)
      toast.success(t("stock.transfers.toastModified"))
    } else {
      await addMovement(values)
      toast.success(t("stock.transfers.toastCreated"))
    }
  }

  async function handleSettlement(values: SettlementValues) {
    if (!settlingTransfer) return
    const { id, ...rest } = settlingTransfer
    await updateMovement(id, { ...rest, montantRegle: (settlingTransfer.montantRegle ?? 0) + values.montant })
    toast.success(t("stock.transfers.toastSettlementRecorded"))
    setSettlingTransfer(null)
  }

  const columns: DataTableColumn<StockMovement>[] = [
    { key: "date", label: t("stock.movements.colDate"), render: (m) => formatDate(m.date) },
    { key: "article", label: t("stock.movements.colArticle"), render: (m) => articles.find((a) => a.id === m.articleId)?.nom ?? "—" },
    {
      key: "circuit",
      label: t("stock.transfers.colCircuit"),
      render: (m) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          {t(STOCK_LOCATION_LABEL_KEYS[m.emplacement])}
          <ArrowLeftRight className="h-3.5 w-3.5 text-muted-foreground" />
          {m.emplacementDestination ? t(STOCK_LOCATION_LABEL_KEYS[m.emplacementDestination]) : "—"}
        </span>
      ),
    },
    {
      key: "quantite",
      label: t("stock.movements.colQuantity"),
      render: (m) => `${formatNumber(m.quantite)} ${articles.find((a) => a.id === m.articleId)?.unite ?? ""}`,
    },
    { key: "responsable", label: t("stock.transfers.colResponsible"), render: (m) => m.responsable || <span className="text-muted-foreground">—</span> },
    { key: "montant", label: t("stock.transfers.colValue"), render: (m) => formatCurrency(m.montant ?? 0) },
    {
      key: "creance",
      label: t("stock.transfers.colDebt"),
      render: (m) => {
        const due = computeTransferDue(m)
        if ((m.montant ?? 0) === 0) return <StatusBadge label={t("stock.transfers.debtNone")} tone="muted" />
        if (due <= 0) return <StatusBadge label={t("stock.transfers.debtSettled")} tone="success" />
        return <StatusBadge label={formatCurrency(due)} tone={m.montantRegle ? "warning" : "destructive"} />
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
              {computeTransferDue(m) > 0 && (
                <Button variant="ghost" size="icon" onClick={() => setSettlingTransfer(m)} aria-label={t("stock.transfers.recordSettlement")}>
                  <HandCoins className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => openEdit(m)} aria-label={t("common.edit")}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  deleteMovement(m.id)
                  toast.success(t("stock.transfers.toastDeleted"))
                }}
                aria-label={t("common.delete")}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        } as DataTableColumn<StockMovement>]
      : []),
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={ArrowLeftRight} label={t("stock.transfers.statCount")} value={formatNumber(transfers.length)} tone="primary" />
        <StatCard icon={HandCoins} label={t("stock.transfers.statTransferred")} value={formatCurrency(totalTransferred)} tone="info" />
        <StatCard icon={HandCoins} label={t("stock.transfers.statOutstanding")} value={formatCurrency(totalDue)} tone={totalDue > 0 ? "warning" : "success"} />
      </div>

      {debts.length > 0 && (
        <div className="mb-4 rounded-xl border border-border bg-surface p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">{t("stock.transfers.debtsTitle")}</p>
          <ul className="flex flex-col gap-2">
            {debts.map((debt) => (
              <li key={`${debt.from}-${debt.to}`} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">
                  {t("stock.transfers.debtLine", {
                    to: t(STOCK_LOCATION_LABEL_KEYS[debt.to]),
                    from: t(STOCK_LOCATION_LABEL_KEYS[debt.from]),
                  })}
                </span>
                <span className={debt.reste > 0 ? "font-medium text-warning" : "font-medium text-success"}>
                  {formatCurrency(debt.reste)} / {formatCurrency(debt.montant)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {canEdit && (
        <div className="mb-3 flex justify-end">
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("stock.transfers.newTransfer")}
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={transfers}
        rowKey={(m) => m.id}
        isLoading={isLoading}
        emptyIcon={ArrowLeftRight}
        emptyTitle={t("stock.transfers.emptyTitle")}
        emptyDescription={t("stock.transfers.emptyDescription")}
      />

      {canEdit && (
        <>
          <StockTransferDialog open={transferOpen} onOpenChange={setTransferOpen} articles={articles} editingEntry={editingTransfer} onSubmit={handleSubmit} />
          <QuickAddDialog
            open={!!settlingTransfer}
            onOpenChange={(open) => !open && setSettlingTransfer(null)}
            title={t("stock.transfers.settlementDialogTitle")}
            schema={settlementSchema}
            fields={settlementFields}
            defaultValues={{ montant: 0 }}
            onSubmit={handleSettlement}
          />
        </>
      )}
    </div>
  )
}
