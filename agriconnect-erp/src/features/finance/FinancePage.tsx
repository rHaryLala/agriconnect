import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus, Wallet, TrendingDown, TrendingUp, Trash2, Pencil, Settings2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { TypesManagerDialog } from "@/components/shared/TypesManagerDialog"
import { TransactionDialog } from "./TransactionDialog"
import { FinanceChart } from "./FinanceChart"
import { useFinanceStore } from "./financeStore"
import { useCategoriesStore } from "./categoriesStore"
import { computeTotals, computeMonthlySeries } from "@/lib/financeCalc"
import { formatDate, formatCurrency } from "@/lib/format"
import { hasAlertKeyword, type RowTone } from "@/lib/alerts"
import type { FinanceTransaction } from "@/types/finance"
import { CategoryBreakdownChart } from "./CategoryBreakdownChart"

export default function FinancePage() {
  const { transactions, isLoading, fetchAll, addTransaction, updateTransaction, deleteTransaction } = useFinanceStore()
  const { depense: depenseCategories, recette: recetteCategories, addCategory, updateCategory, removeCategory } = useCategoriesStore()

  const [entryOpen, setEntryOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<FinanceTransaction | null>(null)
  const [manageDepensesOpen, setManageDepensesOpen] = useState(false)
  const [manageRecettesOpen, setManageRecettesOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState<"tous" | "depense" | "recette">("tous")
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const { totalRecettes, totalDepenses, marge } = useMemo(() => computeTotals(transactions), [transactions])
  const monthlySeries = useMemo(() => computeMonthlySeries(transactions), [transactions])

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((t) => {
        if (typeFilter !== "tous" && t.type !== typeFilter) return false
        if (dateDebut && t.date < dateDebut) return false
        if (dateFin && t.date > dateFin) return false
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
      await updateTransaction(editingEntry.id, values)
      toast.success("Transaction modifiée")
    } else {
      await addTransaction(values)
      toast.success("Transaction enregistrée")
    }
  }
    
  function rowTone(t: FinanceTransaction): RowTone {
    return hasAlertKeyword(t.description) ? "warning" : null
  }

  const columns: DataTableColumn<FinanceTransaction>[] = [
    { key: "date", label: "Date", render: (t) => formatDate(t.date) },
    {
      key: "type",
      label: "Type",
      render: (t) => <StatusBadge label={t.type === "recette" ? "Recette" : "Dépense"} tone={t.type === "recette" ? "success" : "destructive"} />,
    },
    { key: "categorie", label: "Catégorie", render: (t) => t.categorie },
    {
      key: "montant",
      label: "Montant",
      render: (t) => (
        <span className={t.type === "recette" ? "text-success" : "text-destructive"}>
          {t.type === "recette" ? "+" : "−"} {formatCurrency(t.montant)}
        </span>
      ),
    },
    { key: "description", label: "Description", render: (t) => <span className="text-muted-foreground">{t.description}</span> },
    {
      key: "actions",
      label: "",
      className: "text-right",
      sticky: true,
      render: (t) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(t)} aria-label="Modifier">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { deleteTransaction(t.id); toast.success("Transaction supprimée") }} aria-label="Supprimer">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">Finance</h2>
      <p className="mb-6 text-sm text-muted-foreground">Dépenses, recettes et marge</p>

      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={TrendingUp} label="Recettes totales" value="" tone="success" animate={{ target: totalRecettes, format: (n) => formatCurrency(Math.round(n)) }} />
        <StatCard icon={TrendingDown} label="Dépenses totales" value="" tone="destructive" animate={{ target: totalDepenses, format: (n) => formatCurrency(Math.round(n)) }} />
        <StatCard icon={Wallet} label="Marge" value="" tone={marge >= 0 ? "success" : "destructive"} animate={{ target: marge, format: (n) => formatCurrency(Math.round(n)) }} />
      </div>

      <div className="mb-6">
        <FinanceChart data={monthlySeries} />
      </div>
      
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Répartition des dépenses</p>
          <CategoryBreakdownChart transactions={transactions} type="depense" />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Répartition des recettes</p>
          <CategoryBreakdownChart transactions={transactions} type="recette" />
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          {(["tous", "depense", "recette"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setTypeFilter(f)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-200 ${
                typeFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "tous" ? "Tous" : f === "depense" ? "Dépenses" : "Recettes"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5">
            <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="bg-transparent text-sm text-foreground outline-none" />
            <span className="text-xs text-muted-foreground">→</span>
            <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="bg-transparent text-sm text-foreground outline-none" />
            {(dateDebut || dateFin) && (
              <button type="button" onClick={() => { setDateDebut(""); setDateFin("") }} aria-label="Réinitialiser les dates" className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button variant="outline" onClick={() => setManageDepensesOpen(true)} className="gap-2">
            <Settings2 className="h-4 w-4" />
            Catégories dépenses
          </Button>
          <Button variant="outline" onClick={() => setManageRecettesOpen(true)} className="gap-2">
            <Settings2 className="h-4 w-4" />
            Catégories recettes
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle transaction
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filteredTransactions}
        rowKey={(t) => t.id}
        isLoading={isLoading}
        emptyIcon={Wallet}
        emptyTitle="Aucune transaction"
        emptyDescription="Enregistre la première transaction, ou ajuste les filtres ci-dessus."
        rowTone={rowTone}
      />

      <TransactionDialog
        open={entryOpen}
        onOpenChange={setEntryOpen}
        depenseCategories={depenseCategories}
        recetteCategories={recetteCategories}
        editingEntry={editingEntry}
        onSubmit={handleSubmit}
      />

      <TypesManagerDialog
        open={manageDepensesOpen}
        onOpenChange={setManageDepensesOpen}
        title="Gérer les catégories de dépenses"
        fields={[{ name: "nom", label: "Nom de la catégorie", type: "text" }]}
        items={depenseCategories}
        onAdd={(v) => addCategory("depense", v.nom as string)}
        onUpdate={(id, v) => updateCategory("depense", id, v.nom as string)}
        onDelete={(id) => removeCategory("depense", id)}
      />

      <TypesManagerDialog
        open={manageRecettesOpen}
        onOpenChange={setManageRecettesOpen}
        title="Gérer les catégories de recettes"
        fields={[{ name: "nom", label: "Nom de la catégorie", type: "text" }]}
        items={recetteCategories}
        onAdd={(v) => addCategory("recette", v.nom as string)}
        onUpdate={(id, v) => updateCategory("recette", id, v.nom as string)}
        onDelete={(id) => removeCategory("recette", id)}
      />
    </div>
  )
}