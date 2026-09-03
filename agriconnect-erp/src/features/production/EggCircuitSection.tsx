import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, Warehouse, Trash2, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { EggTransferDialog } from "./EggTransferDialog"
import { EggSaleDialog } from "./EggSaleDialog"
import { EGG_LOCATIONS, type EggTransfer, type EggLocation } from "@/types/eggLocation"
import { computeLocationStock, totalStock } from "@/lib/eggLocationCalc"
import { useEggTransfersStore } from "./eggTransfersStore"
import { useInvoicesStore } from "@/features/clients/invoicesStore"
import { useClientsStore } from "@/features/clients/clientsStore"
import { formatDate, formatNumber } from "@/lib/format"
import type { PouleEntry } from "@/types/production"

export function EggCircuitSection({ pouleEntries }: { pouleEntries: PouleEntry[] }) {
  const { t } = useTranslation()
  const { transfers, isLoading, fetchAll, addTransfer, deleteTransfer } = useEggTransfersStore()
  const { addInvoice } = useInvoicesStore()
  const { clients, fetchAll: fetchClients } = useClientsStore()
  const [transferOpen, setTransferOpen] = useState(false)
  const [saleOpen, setSaleOpen] = useState(false)

  useEffect(() => {
    fetchAll()
    fetchClients()
  }, [fetchAll, fetchClients])

  const stockByLocation = useMemo(
    () => Object.fromEntries(EGG_LOCATIONS.map((loc) => [loc, computeLocationStock(loc, pouleEntries, transfers)])),
    [pouleEntries, transfers]
  )

  async function handleAddTransfer(values: Omit<EggTransfer, "id" | "to"> & { to: EggLocation }) {
    await addTransfer(values)
    toast.success(t("production.circuit.toastCreated"))
  }
  async function handleAddSale(transfer: Omit<EggTransfer, "id">, clientId: string, montantInitial: number) {
    await addTransfer(transfer)
    await addInvoice({
      clientId,
      date: transfer.date,
      paymentMethod: "commande",
      items: Object.entries(transfer.quantities)
        .filter(([, qty]) => qty > 0)
        .map(([eggCategory, qty]) => ({ eggCategory: eggCategory as never, quantite: qty, prixUnitaire: 0 })), // prix déjà appliqué dans le total du dialog ; recalcul détaillé possible au besoin
      montantPaye: montantInitial,
    })
    toast.success(t("production.circuit.toastSaleCreated"))
  }

  const columns: DataTableColumn<EggTransfer>[] = [
    { key: "date", label: t("production.circuit.colDate"), render: (tr) => formatDate(tr.date) },
    { key: "from", label: t("production.circuit.colFrom"), render: (tr) => t(`production.circuit.location${tr.from.charAt(0).toUpperCase() + tr.from.slice(1)}`) },
    { key: "to", label: t("production.circuit.colTo"), render: (tr) => (tr.to === "externe" ? t("production.circuit.destinationExternal") : t(`production.circuit.location${tr.to.charAt(0).toUpperCase() + tr.to.slice(1)}`)) },
    { key: "quantity", label: t("production.circuit.colQuantity"), render: (tr) => formatNumber(totalStock(tr.quantities)) },
    { key: "invoiced", label: t("production.circuit.colInvoiced"), render: (tr) => <StatusBadge label={tr.invoiceId ? t("production.circuit.invoicedYes") : t("production.circuit.invoicedNo")} tone={tr.invoiceId ? "success" : "muted"} /> },
    { key: "responsable", label: t("production.circuit.colResponsible"), render: (tr) => tr.responsable },
    {
      key: "actions", label: "", className: "text-right", sticky: true,
      render: (tr) => (
        <Button variant="ghost" size="icon" onClick={() => { deleteTransfer(tr.id); toast.success(t("production.circuit.toastDeleted")) }} aria-label={t("common.delete")}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ]

  return (
    <div className="mt-8">
      <p className="mb-3 text-sm font-semibold text-foreground">{t("production.circuit.title")}</p>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {EGG_LOCATIONS.map((loc) => (
          <StatCard key={loc} icon={Warehouse} label={t(`production.circuit.location${loc.charAt(0).toUpperCase() + loc.slice(1)}`)} value={formatNumber(totalStock(stockByLocation[loc]))} tone={loc === "ferme" ? "success" : loc === "magasinier" ? "info" : "primary"} hint={t("production.circuit.stockLabel")} />
        ))}
      </div>

      <div className="mb-3 flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => setTransferOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("production.circuit.newTransfer")}
        </Button>
        <Button onClick={() => setSaleOpen(true)} className="gap-2">
          <Receipt className="h-4 w-4" />
          {t("production.circuit.newSale")}
        </Button>
      </div>

      <DataTable columns={columns} rows={transfers} rowKey={(tr) => tr.id} isLoading={isLoading} emptyIcon={Warehouse} emptyTitle={t("production.circuit.emptyTitle")} emptyDescription={t("production.circuit.emptyDescription")} />

      <EggTransferDialog open={transferOpen} onOpenChange={setTransferOpen} pouleEntries={pouleEntries} transfers={transfers} onSubmit={handleAddTransfer} />
      <EggSaleDialog open={saleOpen} onOpenChange={setSaleOpen} pouleEntries={pouleEntries} transfers={transfers} clients={clients} onSubmit={handleAddSale} />
    </div>
  )
}