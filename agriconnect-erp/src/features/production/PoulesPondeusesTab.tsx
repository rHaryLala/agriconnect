import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, Egg, Trash2, Pencil, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { TypesManagerDialog } from "@/components/shared/TypesManagerDialog"
import { EggPricesDialog } from "@/components/shared/EggPricesDialog"
import { PouleEntryDialog } from "./PouleEntryDialog"
import { useProductionStore } from "./productionStore"
import { useCagesStore } from "./cagesStore"
import { useEggPricesStore } from "./eggPricesStore"
import { formatDate, formatNumber, formatCurrency } from "@/lib/format"
import { totalPoules, totalOeufs, estimateValue } from "@/lib/eggCalc"
import { hasAlertKeyword, type RowTone } from "@/lib/alerts"
import { EGG_CATEGORIES, type PouleEntry } from "@/types/production"

export function PoulesPondeusesTab() {
  const { t } = useTranslation()
  const { poules: entries, isLoading, fetchAll, addPoule, updatePoule, deletePoule } = useProductionStore()
  const { cages: cagesProfiles, addCage, updateCage, removeCage } = useCagesStore()
  const prices = useEggPricesStore((s) => s.prices)
  const [entryOpen, setEntryOpen] = useState(false)
  const [cageOpen, setCageOpen] = useState(false)
  const [pricesOpen, setPricesOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<PouleEntry | null>(null)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const latest = entries[0]
  const totalPoulesActuel = latest ? totalPoules(latest) : 0
  const latestEggsTotal = latest ? totalOeufs(latest.production) : 0
  const tauxPonte = latest && totalPoulesActuel > 0 ? (latestEggsTotal / totalPoulesActuel) * 100 : 0
  const mortaliteCumulee = entries.reduce((sum, e) => sum + e.mortalite, 0)
  const latestValue = latest ? estimateValue(latest.production, prices) : 0

  function openCreate() {
    setEditingEntry(null)
    setEntryOpen(true)
  }
  function openEdit(entry: PouleEntry) {
    setEditingEntry(entry)
    setEntryOpen(true)
  }

  async function handleSubmit(values: Omit<PouleEntry, "id">) {
    if (editingEntry) {
      await updatePoule(editingEntry.id, values)
      toast.success(t("production.poules.toastModified"))
    } else {
      await addPoule(values)
      toast.success(t("production.poules.toastCreated"))
    }
  }

  function rowTone(e: PouleEntry): RowTone {
    if (hasAlertKeyword(e.observation)) return "critical"
    if (e.mortalite > 0) return "warning"
    return null
  }

  const columns: DataTableColumn<PouleEntry>[] = [
    { key: "date", label: t("production.poules.colDate"), render: (e) => formatDate(e.date) },
    ...cagesProfiles.map((c): DataTableColumn<PouleEntry> => ({
      key: c.id, label: c.nom,
      render: (e) => formatNumber(e.cages.find((cg) => cg.cageId === c.id)?.nbPoules ?? 0),
    })),
    { key: "total", label: t("production.poules.colTotal"), render: (e) => formatNumber(totalPoules(e)) },
    ...EGG_CATEGORIES.map((cat): DataTableColumn<PouleEntry> => ({
      key: cat, label: t(`production.poules.eggCategories.${cat}`),
      render: (e) => formatNumber(e.production[cat]),
    })),
    { key: "aliments", label: t("production.poules.colFeed"), render: (e) => `${formatNumber(e.alimentsKg)} kg` },
    { key: "mortalite", label: t("production.poules.colMortality"), render: (e) => formatNumber(e.mortalite) },
    { key: "observation", label: t("production.poules.colObservation"), render: (e) => <span className="text-muted-foreground">{e.observation}</span> },
    {
      key: "actions", label: "", className: "text-right", sticky: true,
      render: (e) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(e)} aria-label={t("common.edit")}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { deletePoule(e.id); toast.success(t("production.poules.toastDeleted")) }} aria-label={t("common.delete")}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Egg} label={t("production.poules.statHensCount")} value={formatNumber(totalPoulesActuel)} tone="primary" />
        <StatCard icon={Egg} label={t("production.poules.statLayingRate")} value={`${tauxPonte.toFixed(1)} %`} tone="success" />
        <StatCard icon={Egg} label={t("production.poules.statEggsTotal")} value={formatNumber(latestEggsTotal)} tone="warning" />
        <StatCard icon={Egg} label={t("production.poules.statEggsValue")} value={formatCurrency(latestValue)} tone="info" />
        <StatCard icon={Egg} label={t("production.poules.statMortality")} value={formatNumber(mortaliteCumulee)} tone="destructive" />
      </div>

      <div className="mb-3 flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => setPricesOpen(true)} className="gap-2">
          <Settings2 className="h-4 w-4" />
          {t("production.poules.managePricesButton")}
        </Button>
        <Button variant="outline" onClick={() => setCageOpen(true)} className="gap-2">
          <Settings2 className="h-4 w-4" />
          {t("production.poules.manageCagesButton")}
        </Button>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("production.common.newEntry")}
        </Button>
      </div>

      <DataTable columns={columns} rows={entries} rowKey={(e) => e.id} isLoading={isLoading} emptyIcon={Egg} emptyTitle={t("production.poules.emptyTitle")} emptyDescription={t("production.poules.emptyDescription")} rowTone={rowTone} />

      <PouleEntryDialog open={entryOpen} onOpenChange={setEntryOpen} cages={cagesProfiles} editingEntry={editingEntry} onSubmit={handleSubmit} />

      <TypesManagerDialog
        open={cageOpen} onOpenChange={setCageOpen}
        title={t("production.poules.manageCagesTitle")}
        fields={[{ name: "nom", label: t("production.poules.cageNameLabel"), type: "text" }, { name: "capaciteMax", label: t("production.poules.cageCapacityLabel"), type: "number" }]}
        items={cagesProfiles}
        onAdd={(v) => addCage(v.nom as string, v.capaciteMax as number)}
        onUpdate={(id, v) => updateCage(id, { nom: v.nom as string, capaciteMax: v.capaciteMax as number })}
        onDelete={removeCage}
      />

      <EggPricesDialog open={pricesOpen} onOpenChange={setPricesOpen} />
    </div>
  )
}