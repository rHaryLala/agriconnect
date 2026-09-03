import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, Warehouse, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { EggTransferDialog } from "./EggTransferDialog"
import { EGG_LOCATIONS, type EggTransfer } from "@/types/eggLocation"
import { computeLocationStock, totalStock } from "@/lib/eggLocationCalc"
import { useEggTransfersStore } from "./eggTransfersStore"
import { formatDate, formatNumber } from "@/lib/format"
import type { PouleEntry } from "@/types/production"

interface EggCircuitSectionProps {
  pouleEntries: PouleEntry[]
}

export function EggCircuitSection({ pouleEntries }: EggCircuitSectionProps) {
  const { t } = useTranslation()
  const { transfers, isLoading, fetchAll, addTransfer, deleteTransfer } = useEggTransfersStore()
  const [transferOpen, setTransferOpen] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const stockByLocation = useMemo(
    () => Object.fromEntries(EGG_LOCATIONS.map((loc) => [loc, computeLocationStock(loc, pouleEntries, transfers)])),
    [pouleEntries, transfers]
  )

  async function handleAdd(values: Omit<EggTransfer, "id">) {
    await addTransfer(values)
    toast.success(t("production.circuit.toastCreated"))
  }

  const columns: DataTableColumn<EggTransfer>[] = [
    { key: "date", label: t("production.circuit.colDate"), render: (tr) => formatDate(tr.date) },
    { key: "from", label: t("production.circuit.colFrom"), render: (tr) => t(`production.circuit.location${tr.from.charAt(0).toUpperCase() + tr.from.slice(1)}`) },
    { key: "to", label: t("production.circuit.colTo"), render: (tr) => t(`production.circuit.location${tr.to.charAt(0).toUpperCase() + tr.to.slice(1)}`) },
    { key: "quantity", label: t("production.circuit.colQuantity"), render: (tr) => formatNumber(totalStock(tr.quantities)) },
    { key: "responsable", label: t("production.circuit.colResponsible"), render: (tr) => tr.responsable },
    { key: "observation", label: t("production.circuit.colObservation"), render: (tr) => <span className="text-muted-foreground">{tr.observation || "—"}</span> },
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
          <StatCard
            key={loc}
            icon={Warehouse}
            label={t(`production.circuit.location${loc.charAt(0).toUpperCase() + loc.slice(1)}`)}
            value={formatNumber(totalStock(stockByLocation[loc]))}
            tone={loc === "ferme" ? "success" : loc === "magasinier" ? "info" : "primary"}
            hint={t("production.circuit.stockLabel")}
          />
        ))}
      </div>

      <div className="mb-3 flex justify-end">
        <Button onClick={() => setTransferOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("production.circuit.newTransfer")}
        </Button>
      </div>

      <DataTable columns={columns} rows={transfers} rowKey={(tr) => tr.id} isLoading={isLoading} emptyIcon={Warehouse} emptyTitle={t("production.circuit.emptyTitle")} emptyDescription={t("production.circuit.emptyDescription")} />

      <EggTransferDialog open={transferOpen} onOpenChange={setTransferOpen} pouleEntries={pouleEntries} transfers={transfers} onSubmit={handleAdd} />
    </div>
  )
}