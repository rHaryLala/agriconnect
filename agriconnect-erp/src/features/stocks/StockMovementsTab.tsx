import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus, ArrowDownCircle, ArrowUpCircle, Pencil, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { StockMovementDialog } from "./StockMovementDialog"
import { useStockStore } from "./stockStore"
import { computeCurrentStock, computeRunningBalances } from "@/lib/stockCalc"
import { formatDate, formatNumber } from "@/lib/format"
import type { RowTone } from "@/lib/alerts"
import type { StockMovement } from "@/types/stock"

function isWithinLastDays(dateStr: string, days: number): boolean {
  const diff = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  return diff <= days
}

export function StockMovementsTab() {
  const { articles, movements, isLoading, addMovement, updateMovement, deleteMovement } = useStockStore()
  const [movementOpen, setMovementOpen] = useState(false)
  const [editingMovement, setEditingMovement] = useState<StockMovement | null>(null)
  const [deletingMovement, setDeletingMovement] = useState<StockMovement | null>(null)
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")

  const runningBalances = useMemo(() => {
    const merged: Record<string, number> = {}
    articles.forEach((a) => Object.assign(merged, computeRunningBalances(a, movements)))
    return merged
  }, [articles, movements])

  const entrees7j = movements.filter((m) => m.type === "entree" && isWithinLastDays(m.date, 7)).length
  const sorties7j = movements.filter((m) => m.type === "sortie" && isWithinLastDays(m.date, 7)).length

  const filtered = useMemo(
    () =>
      movements.filter((m) => {
        if (dateDebut && m.date < dateDebut) return false
        if (dateFin && m.date > dateFin) return false
        return true
      }),
    [movements, dateDebut, dateFin]
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
        const current = computeCurrentStock(article, movements.filter((m) => m.id !== editingMovement?.id))
        if (values.quantite > current) {
          toast.error(`Stock insuffisant : ${article.nom} n'a que ${current} ${article.unite} disponible(s).`)
          return
        }
      }
    }
    if (editingMovement) {
      await updateMovement(editingMovement.id, values)
      toast.success("Mouvement modifié")
    } else {
      await addMovement(values)
      toast.success("Mouvement enregistré")
    }
  }

  function confirmDelete() {
    if (!deletingMovement) return
    deleteMovement(deletingMovement.id)
    toast.success("Mouvement supprimé")
    setDeletingMovement(null)
  }

  function rowTone(m: StockMovement): RowTone {
    const balance = runningBalances[m.id]
    return balance !== undefined && balance < 0 ? "critical" : null
  }

  const columns: DataTableColumn<StockMovement>[] = [
    { key: "date", label: "Date", render: (m) => formatDate(m.date) },
    { key: "article", label: "Article", render: (m) => articles.find((a) => a.id === m.articleId)?.nom ?? "—" },
    {
      key: "type",
      label: "Type",
      render: (m) => (
        <span className={`inline-flex items-center gap-1.5 text-sm ${m.type === "entree" ? "text-success" : "text-destructive"}`}>
          {m.type === "entree" ? <ArrowDownCircle className="h-4 w-4" /> : <ArrowUpCircle className="h-4 w-4" />}
          {m.type === "entree" ? "Entrée" : "Sortie"}
        </span>
      ),
    },
    { key: "quantite", label: "Quantité", render: (m) => formatNumber(m.quantite) },
    { key: "destinataire", label: "Destinataire", render: (m) => m.destinataire || <span className="text-muted-foreground">—</span> },
    {
      key: "reste",
      label: "Reste",
      render: (m) => {
        const article = articles.find((a) => a.id === m.articleId)
        const balance = runningBalances[m.id]
        return balance !== undefined && article ? `${formatNumber(balance)} ${article.unite}` : "—"
      },
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      sticky: true,
      render: (m) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(m)} aria-label="Modifier">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeletingMovement(m)} aria-label="Supprimer">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground">{movements.length} mouvements</span>
        <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">↓ {entrees7j} entrées (7j)</span>
        <span className="rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive">↑ {sorties7j} sorties (7j)</span>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5">
          <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="bg-transparent text-sm text-foreground outline-none" />
          <span className="text-xs text-muted-foreground">→</span>
          <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="bg-transparent text-sm text-foreground outline-none" />
          {(dateDebut || dateFin) && (
            <button type="button" onClick={() => { setDateDebut(""); setDateFin("") }} aria-label="Réinitialiser" className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau mouvement
        </Button>
      </div>

      <DataTable columns={columns} rows={filtered} rowKey={(m) => m.id} isLoading={isLoading} emptyIcon={ArrowDownCircle} emptyTitle="Aucun mouvement" rowTone={rowTone} />

      <StockMovementDialog open={movementOpen} onOpenChange={setMovementOpen} articles={articles} editingEntry={editingMovement} onSubmit={handleSubmit} />

      <AlertDialog open={!!deletingMovement} onOpenChange={(open) => !open && setDeletingMovement(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce mouvement ?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingMovement && `${deletingMovement.type === "entree" ? "Entrée" : "Sortie"} de ${formatNumber(deletingMovement.quantite)} — `}
              Cette action est irréversible et modifiera le stock calculé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}