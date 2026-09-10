import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, Bean, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { HaricotMovementDialog } from "./HaricotMovementDialog"
import { useHaricotsStore } from "./haricotsStore"
import { useInvoicesStore } from "@/features/clients/invoicesStore"
import { useClientsStore } from "@/features/clients/clientsStore"
import { formatDate, formatNumber, formatCurrency } from "@/lib/format"
import { computeStock } from "@/lib/haricotsCalc"
import type { HaricotMouvement } from "@/types/production"

export function HaricotsTab({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation()
  const { mouvements, isLoading, fetchAll, addMouvement, linkInvoice, deleteMouvement } = useHaricotsStore()
  const { addInvoice, invoices } = useInvoicesStore()
  const { clients, fetchAll: fetchClients } = useClientsStore()
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchAll()
    fetchClients()
  }, [fetchAll, fetchClients])

  const stockBlanc = computeStock(mouvements, "blanc")
  const stockRouge = computeStock(mouvements, "rouge")

  function clientName(id?: string): string {
    if (!id) return "—"
    return clients.find((c) => c.id === id)?.nom ?? "—"
  }

  function recuNumero(invoiceId?: string): string {
    if (!invoiceId) return "—"
    return invoices.find((inv) => inv.id === invoiceId)?.numero ?? "—"
  }

  async function handleAddMouvement(data: Omit<HaricotMouvement, "id">) {
    const created = await addMouvement(data)
    if (data.type === "vente" && data.clientId) {
      const total = data.quantiteKg * (data.prixUnitaire ?? 0)
      const invoice = await addInvoice({
        clientId: data.clientId,
        date: data.date,
        paymentMethod: data.paymentMethod ?? "comptant",
        items: [{ quantite: data.quantiteKg, prixUnitaire: data.prixUnitaire ?? 0 }],
        montantPaye: data.paymentMethod === "comptant" ? total : 0,
      })
      linkInvoice(created.id, invoice.id)
    }
    toast.success(t("production.haricots.toastCreated"))
  }

  const columns: DataTableColumn<HaricotMouvement>[] = [
    { key: "date", label: t("production.riz.fieldDate"), render: (m) => formatDate(m.date) },
    { key: "variante", label: t("production.haricots.fieldVariante"), render: (m) => t(m.variante === "rouge" ? "production.haricots.varianteRouge" : "production.haricots.varianteBlanc") },
    { key: "type", label: t("production.haricots.fieldType"), render: (m) => t(m.type === "vente" ? "production.haricots.typeVente" : "production.haricots.typeEntree") },
    { key: "quantiteKg", label: t("production.riz.fieldQuantiteKg"), render: (m) => `${formatNumber(m.quantiteKg)} kg` },
    { key: "client", label: t("clients.invoices.colClient"), render: (m) => (m.type === "vente" ? clientName(m.clientId) : "—") },
    { key: "prixUnitaire", label: t("production.riz.fieldPrixUnitaire"), render: (m) => (m.prixUnitaire ? formatCurrency(m.prixUnitaire) : "—") },
    { key: "paymentMethod", label: t("production.riz.fieldPaymentMethod"), render: (m) => (m.paymentMethod ? t(`clients.invoices.payment${m.paymentMethod === "salaire" ? "Salaire" : m.paymentMethod === "commande" ? "Commande" : "Comptant"}`) : "—") },
    { key: "numeroRecu", label: t("production.poulard.colReceiptNumber"), render: (m) => recuNumero(m.invoiceId) },
    { key: "observation", label: t("production.common.observation"), render: (m) => <span className="text-muted-foreground">{m.observation}</span> },
    ...(canEdit
      ? [{
          key: "actions", label: "", className: "text-right", sticky: true,
          render: (m: HaricotMouvement) => (
            <Button variant="ghost" size="icon" onClick={() => { deleteMouvement(m.id); toast.success(t("production.haricots.toastDeleted")) }} aria-label={t("common.delete")}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          ),
        } as DataTableColumn<HaricotMouvement>]
      : []),
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-2">
        <StatCard icon={Bean} label={t("production.haricots.statStockBlanc")} value={`${formatNumber(stockBlanc)} kg`} tone="primary" />
        <StatCard icon={Bean} label={t("production.haricots.statStockRouge")} value={`${formatNumber(stockRouge)} kg`} tone="destructive" />
      </div>

      {canEdit && (
        <div className="mb-3 flex justify-end">
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("production.haricots.newMovement")}
          </Button>
        </div>
      )}

      <DataTable columns={columns} rows={mouvements} rowKey={(m) => m.id} isLoading={isLoading} emptyIcon={Bean} emptyTitle={t("production.haricots.emptyTitle")} emptyDescription={t("production.haricots.emptyDescription")} />

      {canEdit && (
        <HaricotMovementDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          clients={clients}
          stockBlanc={stockBlanc}
          stockRouge={stockRouge}
          onSubmit={handleAddMouvement}
        />
      )}
    </div>
  )
}
