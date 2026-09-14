import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, Egg, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { KuroilerOeufMovementDialog } from "./KuroilerOeufMovementDialog"
import { useKuroilerOeufsStore } from "./kuroilerOeufsStore"
import { KUROILER_OEUF_TYPE_LABEL_KEYS, KUROILER_OEUF_TYPE_TONES } from "./kuroilerOeufLabels"
import { useInvoicesStore } from "@/features/clients/invoicesStore"
import { useClientsStore } from "@/features/clients/clientsStore"
import { computeStockOeufsKuroiler, countOeufsEnCouveuse, sumOeufsSurPeriode } from "@/lib/kuroilerCalc"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import { startOfMonth } from "@/lib/dateRange"
import type { KuroilerOeufMouvement } from "@/types/production"

export function KuroilerEggsTab({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation()
  const { mouvements, isLoading, fetchAll, addMouvement, linkInvoice, deleteMouvement } = useKuroilerOeufsStore()
  const { invoices, addInvoice } = useInvoicesStore()
  const { clients, fetchAll: fetchClients } = useClientsStore()
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchAll()
    fetchClients()
  }, [fetchAll, fetchClients])

  const today = new Date().toISOString().slice(0, 10)
  const startMonth = startOfMonth(today)
  const stock = computeStockOeufsKuroiler(mouvements)
  const enCouveuse = countOeufsEnCouveuse(mouvements)
  const ventesMois = sumOeufsSurPeriode(mouvements, "vente", startMonth, today)
  const entreesMois = sumOeufsSurPeriode(mouvements, "entree", startMonth, today)

  function clientName(id?: string): string {
    if (!id) return "—"
    return clients.find((c) => c.id === id)?.nom ?? "—"
  }

  function recuNumero(invoiceId?: string): string {
    if (!invoiceId) return "—"
    return invoices.find((inv) => inv.id === invoiceId)?.numero ?? "—"
  }

  async function handleAddMouvement(data: Omit<KuroilerOeufMouvement, "id">) {
    if (data.type !== "entree" && data.quantite > stock) {
      toast.error(t("production.kuroiler.eggs.insufficientStock", { available: formatNumber(stock), requested: formatNumber(data.quantite) }))
      return
    }
    const created = await addMouvement(data)
    if (data.type === "vente" && data.clientId) {
      const total = data.quantite * (data.prixUnitaire ?? 0)
      const invoice = await addInvoice({
        clientId: data.clientId,
        date: data.date,
        paymentMethod: data.paymentMethod ?? "comptant",
        items: [{ quantite: data.quantite, prixUnitaire: data.prixUnitaire ?? 0 }],
        montantPaye: data.paymentMethod === "comptant" ? total : 0,
      })
      linkInvoice(created.id, invoice.id)
    }
    toast.success(t("production.kuroiler.eggs.toastCreated"))
  }

  const columns: DataTableColumn<KuroilerOeufMouvement>[] = [
    { key: "date", label: t("production.common.date"), render: (m) => formatDate(m.date) },
    {
      key: "type",
      label: t("production.kuroiler.eggs.fieldType"),
      render: (m) => <StatusBadge label={t(KUROILER_OEUF_TYPE_LABEL_KEYS[m.type])} tone={KUROILER_OEUF_TYPE_TONES[m.type]} />,
    },
    { key: "quantite", label: t("production.kuroiler.eggs.fieldQuantity"), render: (m) => formatNumber(m.quantite) },
    { key: "client", label: t("clients.invoices.colClient"), render: (m) => (m.type === "vente" ? clientName(m.clientId) : "—") },
    { key: "prix", label: t("production.riz.fieldPrixUnitaire"), render: (m) => (m.prixUnitaire ? formatCurrency(m.prixUnitaire) : "—") },
    { key: "recu", label: t("production.poulard.colReceiptNumber"), render: (m) => recuNumero(m.invoiceId) },
    { key: "observation", label: t("production.common.observation"), render: (m) => <span className="text-muted-foreground">{m.observation}</span> },
    ...(canEdit
      ? [{
          key: "actions",
          label: "",
          className: "text-right",
          sticky: true,
          render: (m: KuroilerOeufMouvement) => (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                deleteMouvement(m.id)
                toast.success(t("production.kuroiler.eggs.toastDeleted"))
              }}
              aria-label={t("common.delete")}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          ),
        } as DataTableColumn<KuroilerOeufMouvement>]
      : []),
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Egg} label={t("production.kuroiler.eggs.statStock")} value={formatNumber(stock)} tone={stock < 0 ? "destructive" : "primary"} />
        <StatCard icon={Egg} label={t("production.kuroiler.eggs.statEntries")} value={formatNumber(entreesMois)} tone="success" />
        <StatCard icon={Egg} label={t("production.kuroiler.eggs.statSales")} value={formatNumber(ventesMois)} tone="info" />
        <StatCard icon={Egg} label={t("production.kuroiler.eggs.statIncubated")} value={formatNumber(enCouveuse)} tone="warning" hint={t("production.kuroiler.eggs.statIncubatedHint")} />
      </div>

      {canEdit && (
        <div className="mb-3 flex justify-end">
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("production.kuroiler.eggs.newMovement")}
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={mouvements}
        rowKey={(m) => m.id}
        isLoading={isLoading}
        emptyIcon={Egg}
        emptyTitle={t("production.kuroiler.eggs.emptyTitle")}
        emptyDescription={t("production.kuroiler.eggs.emptyDescription")}
      />

      {canEdit && <KuroilerOeufMovementDialog open={dialogOpen} onOpenChange={setDialogOpen} clients={clients} onSubmit={handleAddMouvement} />}
    </div>
  )
}
