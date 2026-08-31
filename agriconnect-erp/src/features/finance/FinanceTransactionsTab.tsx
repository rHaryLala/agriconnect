import { useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, Wallet, Trash2, Pencil, Settings2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { TypesManagerDialog } from "@/components/shared/TypesManagerDialog"
import { TransactionDialog } from "./TransactionDialog"
import { useCategoriesStore } from "./categoriesStore"
import { formatDate, formatCurrency } from "@/lib/format"
import { hasAlertKeyword, type RowTone } from "@/lib/alerts"
import type { FinanceTransaction } from "@/types/finance"

interface FinanceTransactionsTabProps {
  transactions: FinanceTransaction[]
  isLoading: boolean
  onAdd: (values: Omit<FinanceTransaction, "id">) => Promise<void>
  onUpdate: (id: string, values: Omit<FinanceTransaction, "id">) => Promise<void>
  onDelete: (id: string) => void
}

export function FinanceTransactionsTab({ transactions, isLoading, onAdd, onUpdate, onDelete }: FinanceTransactionsTabProps) {
  const { t } = useTranslation()
  const { depense: depenseCategories, recette: recetteCategories, addCategory, updateCategory, removeCategory } = useCategoriesStore()

  const [entryOpen, setEntryOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<FinanceTransaction | null>(null)
  const [manageDepensesOpen, setManageDepensesOpen] = useState(false)
  const [manageRecettesOpen, setManageRecettesOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState<"tous" | "depense" | "recette">("tous")
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")

  const filtered = useMemo(
    () =>
      transactions.filter((tx) => {
        if (typeFilter !== "tous" && tx.type !== typeFilter) return false
        if (dateDebut && tx.date < dateDebut) return false
        if (dateFin && tx.date > dateFin) return false
        return true
      }),
    [transactions, typeFilter, dateDebut, dateFin]
  )

  function openCreate() {
    setEditingEntry(null)
    setEntryOpen(true)
  }
  function openEdit(entry: FinanceTransaction) {
    setEditingEntry(entry)
    setEntryOpen(true)
  }

  async function handleSubmit(values: Omit<FinanceTransaction, "id">) {
    if (editingEntry) {
      await onUpdate(editingEntry.id, values)
      toast.success(t("finance.transactions.toastModified"))
    } else {
      await onAdd(values)
      toast.success(t("finance.transactions.toastCreated"))
    }
  }

  function rowTone(tx: FinanceTransaction): RowTone {
    return hasAlertKeyword(tx.description) ? "warning" : null
  }

  const columns: DataTableColumn<FinanceTransaction>[] = [
    { key: "date", label: t("finance.transactions.colDate"), render: (tx) => formatDate(tx.date) },
    { key: "type", label: t("finance.transactions.colType"), render: (tx) => <StatusBadge label={tx.type === "recette" ? t("finance.transactions.typeRevenue") : t("finance.transactions.typeExpense")} tone={tx.type === "recette" ? "success" : "destructive"} /> },
    { key: "categorie", label: t("finance.transactions.colCategory"), render: (tx) => tx.categorie },
    {
      key: "montant", label: t("finance.transactions.colAmount"),
      render: (tx) => (
        <span className={tx.type === "recette" ? "text-success" : "text-destructive"}>
          {tx.type === "recette" ? "+" : "−"} {formatCurrency(tx.montant)}
        </span>
      ),
    },
    { key: "description", label: t("finance.transactions.colDescription"), render: (tx) => <span className="text-muted-foreground">{tx.description}</span> },
    {
      key: "actions", label: "", className: "text-right", sticky: true,
      render: (tx) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(tx)} aria-label={t("common.edit")}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { onDelete(tx.id); toast.success(t("finance.transactions.toastDeleted")) }} aria-label={t("common.delete")}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          {(["tous", "depense", "recette"] as const).map((f) => (
            <button
              key={f} type="button" onClick={() => setTypeFilter(f)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-200 ${typeFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f === "tous" ? t("finance.transactions.filterAll") : f === "depense" ? t("finance.transactions.filterExpenses") : t("finance.transactions.filterRevenue")}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
          <Button variant="outline" onClick={() => setManageDepensesOpen(true)} className="gap-2">
            <Settings2 className="h-4 w-4" />
            {t("finance.transactions.manageExpenseCategories")}
          </Button>
          <Button variant="outline" onClick={() => setManageRecettesOpen(true)} className="gap-2">
            <Settings2 className="h-4 w-4" />
            {t("finance.transactions.manageRevenueCategories")}
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("finance.transactions.newTransaction")}
          </Button>
        </div>
      </div>

      <DataTable columns={columns} rows={filtered} rowKey={(tx) => tx.id} isLoading={isLoading} emptyIcon={Wallet} emptyTitle={t("finance.transactions.emptyTitle")} emptyDescription={t("finance.transactions.emptyDescription")} rowTone={rowTone} />

      <TransactionDialog open={entryOpen} onOpenChange={setEntryOpen} depenseCategories={depenseCategories} recetteCategories={recetteCategories} editingEntry={editingEntry} onSubmit={handleSubmit} />

      <TypesManagerDialog
        open={manageDepensesOpen} onOpenChange={setManageDepensesOpen}
        title={t("finance.transactions.manageExpenseCategoriesTitle")}
        fields={[{ name: "nom", label: t("finance.transactions.categoryNameLabel"), type: "text" }]}
        items={depenseCategories}
        onAdd={(v) => addCategory("depense", v.nom as string)}
        onUpdate={(id, v) => updateCategory("depense", id, v.nom as string)}
        onDelete={(id) => removeCategory("depense", id)}
      />
      <TypesManagerDialog
        open={manageRecettesOpen} onOpenChange={setManageRecettesOpen}
        title={t("finance.transactions.manageRevenueCategoriesTitle")}
        fields={[{ name: "nom", label: t("finance.transactions.categoryNameLabel"), type: "text" }]}
        items={recetteCategories}
        onAdd={(v) => addCategory("recette", v.nom as string)}
        onUpdate={(id, v) => updateCategory("recette", id, v.nom as string)}
        onDelete={(id) => removeCategory("recette", id)}
      />
    </div>
  )
}