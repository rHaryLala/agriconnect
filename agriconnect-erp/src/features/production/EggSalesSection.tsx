import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Receipt, Warehouse, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { EggSaleDialog } from "./EggSaleDialog"
import { useEggSalesStore } from "./eggSalesStore"
import { useInvoicesStore } from "@/features/clients/invoicesStore"
import { useClientsStore } from "@/features/clients/clientsStore"
import { useEggPricesStore } from "./eggPricesStore"
import { computeFermeStock, totalOeufs } from "@/lib/eggCalc"
import { formatDate, formatNumber } from "@/lib/format"
import type { EggCategory, PouleEntry } from "@/types/production"
import type { EggSale } from "@/types/eggSale"

interface EggSalesSectionProps {
  pouleEntries: PouleEntry[]
  canEdit: boolean
}

export function EggSalesSection({ pouleEntries, canEdit }: EggSalesSectionProps) {
  const { t } = useTranslation()
  const { sales, isLoading, fetchAll, addSale, linkInvoice, deleteSale } = useEggSalesStore()
  const { addInvoice } = useInvoicesStore()
  const { clients, fetchAll: fetchClients } = useClientsStore()
  const eggPrices = useEggPricesStore((s) => s.prices)
  const [saleOpen, setSaleOpen] = useState(false)

  useEffect(() => {
    fetchAll()
    fetchClients()
  }, [fetchAll, fetchClients])

  const fermeStock = useMemo(() => computeFermeStock(pouleEntries, sales), [pouleEntries, sales])

  function clientName(id: string): string {
    return clients.find((c) => c.id === id)?.nom ?? "—"
  }

  async function handleAddSale(sale: Omit<EggSale, "id">, montantInitial: number) {
    const created = await addSale(sale)
    const invoice = await addInvoice({
      clientId: sale.clientId,
      date: sale.date,
      paymentMethod: "commande",
      items: Object.entries(sale.quantities).filter(([, qty]) => qty > 0).map(([eggCategory, qty]) => ({ eggCategory: eggCategory as never, quantite: qty, prixUnitaire: eggPrices[eggCategory as EggCategory] })),
      montantPaye: montantInitial,
    })
    linkInvoice(created.id, invoice.id)
    toast.success(t("production.circuit.toastSaleCreated"))
  }

  const columns: DataTableColumn<EggSale>[] = [
    { key: "date", label: t("production.circuit.colDate"), render: (s) => formatDate(s.date) },
    { key: "client", label: t("clients.invoices.colClient"), render: (s) => clientName(s.clientId) },
    { key: "quantity", label: t("production.circuit.colQuantity"), render: (s) => formatNumber(totalOeufs(s.quantities)) },
    { key: "invoiced", label: t("production.circuit.colInvoiced"), render: (s) => <StatusBadge label={s.invoiceId ? t("production.circuit.invoicedYes") : t("production.circuit.invoicedNo")} tone={s.invoiceId ? "success" : "muted"} /> },
    { key: "responsable", label: t("production.circuit.colResponsible"), render: (s) => s.responsable },
    ...(canEdit
      ? [{
          key: "actions", label: "", className: "text-right", sticky: true,
          render: (s: EggSale) => (
            <Button variant="ghost" size="icon" onClick={() => { deleteSale(s.id); toast.success(t("production.circuit.toastDeleted")) }} aria-label={t("common.delete")}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          ),
        } as DataTableColumn<EggSale>]
      : []),
  ]

  return (
    <div className="mt-8">
      <p className="mb-3 text-sm font-semibold text-foreground">{t("production.circuit.title")}</p>

      <div className="mb-4">
        <StatCard icon={Warehouse} label="Stock Ferme" value={formatNumber(totalOeufs(fermeStock))} tone="success" hint={t("production.circuit.stockLabel")} />
      </div>

      {canEdit && (
        <div className="mb-3 flex justify-end">
          <Button onClick={() => setSaleOpen(true)} className="gap-2">
            <Receipt className="h-4 w-4" />
            {t("production.circuit.newSale")}
          </Button>
        </div>
      )}

      <DataTable columns={columns} rows={sales} rowKey={(s) => s.id} isLoading={isLoading} emptyIcon={Warehouse} emptyTitle={t("production.circuit.emptyTitle")} emptyDescription={t("production.circuit.emptyDescription")} />

      {canEdit && <EggSaleDialog open={saleOpen} onOpenChange={setSaleOpen} pouleEntries={pouleEntries} sales={sales} clients={clients} onSubmit={handleAddSale} />}
    </div>
  )
}