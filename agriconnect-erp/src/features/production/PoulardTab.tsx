import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, Drumstick, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { PoulardMovementDialog } from "./PoulardMovementDialog"
import { usePoulardStore } from "./poulardStore"
import { useInvoicesStore } from "@/features/clients/invoicesStore"
import { useClientsStore } from "@/features/clients/clientsStore"
import { formatDate, formatNumber, formatCurrency } from "@/lib/format"
import { computeEffectifActuel, computeEffectifAt, sumSurPeriode } from "@/lib/poulardCalc"
import { endOfPreviousMonth, startOfMonth } from "@/lib/dateRange"
import type { PoulardMouvement } from "@/types/production"

export function PoulardTab({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation()
  const { mouvements, isLoading, fetchAll, addMouvement, linkInvoice, deleteMouvement } = usePoulardStore()
  const { invoices, addInvoice } = useInvoicesStore()
  const { clients, fetchAll: fetchClients } = useClientsStore()
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchAll()
    fetchClients()
  }, [fetchAll, fetchClients])

  function clientName(id?: string): string {
    if (!id) return "—"
    return clients.find((c) => c.id === id)?.nom ?? "—"
  }

  function recuNumero(invoiceId?: string): string {
    if (!invoiceId) return "—"
    return invoices.find((inv) => inv.id === invoiceId)?.numero ?? "—"
  }

  const today = new Date().toISOString().slice(0, 10)
  const startMonth = startOfMonth(today)
  const effectifActuel = computeEffectifActuel(mouvements)
  const entreesMois = sumSurPeriode(mouvements, "entree", startMonth, today)
  const ventesMois = sumSurPeriode(mouvements, "vente", startMonth, today)
  const mortaliteMois = sumSurPeriode(mouvements, "mortalite", startMonth, today)
  const effectifReporte = computeEffectifAt(mouvements, endOfPreviousMonth(today))

  async function handleAddMouvement(data: Omit<PoulardMouvement, "id">) {
    const created = await addMouvement(data)
    if (data.type === "vente" && data.clientId) {
      const invoice = await addInvoice({
        clientId: data.clientId,
        date: data.date,
        paymentMethod: "commande",
        items: [{ quantite: data.quantite, prixUnitaire: data.prixUnitaire ?? 0 }],
        montantPaye: 0,
      })
      linkInvoice(created.id, invoice.id)
    }
    toast.success(t("production.poulard.toastCreated"))
  }

  const columns: DataTableColumn<PoulardMouvement>[] = [
    { key: "date", label: t("production.poulard.fieldDate"), render: (m) => formatDate(m.date) },
    { key: "type", label: t("production.poulard.fieldType"), render: (m) => t(`production.poulard.type${m.type === "vente" ? "Vente" : m.type === "mortalite" ? "Mortalite" : "Entree"}`) },
    { key: "quantite", label: t("production.poulard.fieldQuantite"), render: (m) => formatNumber(m.quantite) },
    { key: "client", label: t("clients.invoices.colClient"), render: (m) => (m.type === "vente" ? clientName(m.clientId) : "—") },
    { key: "prixUnitaire", label: t("production.poulard.fieldPrixUnitaire"), render: (m) => (m.prixUnitaire ? formatCurrency(m.prixUnitaire) : "—") },
    { key: "numeroRecu", label: t("production.poulard.colReceiptNumber"), render: (m) => recuNumero(m.invoiceId) },
    { key: "observation", label: t("production.common.observation"), render: (m) => <span className="text-muted-foreground">{m.observation}</span> },
    ...(canEdit
      ? [{
          key: "actions", label: "", className: "text-right", sticky: true,
          render: (m: PoulardMouvement) => (
            <Button variant="ghost" size="icon" onClick={() => { deleteMouvement(m.id); toast.success(t("production.poulard.toastDeleted")) }} aria-label={t("common.delete")}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          ),
        } as DataTableColumn<PoulardMouvement>]
      : []),
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Drumstick} label={t("production.poulard.statEffectifActuel")} value={formatNumber(effectifActuel)} tone="primary" />
        <StatCard icon={Drumstick} label={t("production.poulard.statEntreesMois")} value={formatNumber(entreesMois)} tone="success" />
        <StatCard icon={Drumstick} label={t("production.poulard.statVentesMois")} value={formatNumber(ventesMois)} tone="info" />
        <StatCard icon={Drumstick} label={t("production.poulard.statMortaliteMois")} value={formatNumber(mortaliteMois)} tone="destructive" />
        <StatCard icon={Drumstick} label={t("production.poulard.statEffectifReporte")} value={formatNumber(effectifReporte)} tone="warning" hint={t("production.poulard.statEffectifReporteHint")} />
      </div>

      {canEdit && (
        <div className="mb-3 flex justify-end">
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("production.poulard.newMovement")}
          </Button>
        </div>
      )}

      <DataTable columns={columns} rows={mouvements} rowKey={(m) => m.id} isLoading={isLoading} emptyIcon={Drumstick} emptyTitle={t("production.poulard.emptyTitle")} emptyDescription={t("production.poulard.emptyDescription")} />

      {canEdit && <PoulardMovementDialog open={dialogOpen} onOpenChange={setDialogOpen} clients={clients} onSubmit={handleAddMouvement} />}
    </div>
  )
}
