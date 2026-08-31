import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Wheat, Trash2, Pencil, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { TypesManagerDialog } from "@/components/shared/TypesManagerDialog"
import { AgricultureEntryDialog } from "./AgricultureEntryDialog"
import { useProductionStore } from "./productionStore"
import { useCultureTypesStore } from "./cultureTypesStore"
import { formatDate, formatNumber, formatCurrency } from "@/lib/format"
import type { RowTone } from "@/lib/alerts"
import type { CultureEntry } from "@/types/production"

export function AgricultureTab() {
  const { t } = useTranslation()
  const { cultures, isLoading, fetchAll, addCulture, updateCulture, deleteCulture } = useProductionStore()
  const cultureTypes = useCultureTypesStore((s) => s.types)
  const addCultureType = useCultureTypesStore((s) => s.addType)
  const updateCultureType = useCultureTypesStore((s) => s.updateType)
  const removeCultureType = useCultureTypesStore((s) => s.removeType)
  const [entryOpen, setEntryOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<CultureEntry | null>(null)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const surfaceTotale = cultures.reduce((sum, e) => sum + e.surfaceHa, 0)
  const recolteTotale = cultures.reduce((sum, e) => sum + e.recolteQty, 0)
  const coutTotal = cultures.reduce((sum, e) => sum + e.coutIntrants, 0)

  function openCreate() {
    setEditingEntry(null)
    setEntryOpen(true)
  }
  function openEdit(entry: CultureEntry) {
    setEditingEntry(entry)
    setEntryOpen(true)
  }

  async function handleSubmit(values: Omit<CultureEntry, "id">) {
    if (editingEntry) {
      await updateCulture(editingEntry.id, values)
      toast.success(t("production.agriculture.toastModified"))
    } else {
      await addCulture(values)
      toast.success(t("production.agriculture.toastCreated"))
    }
  }

  function rowTone(e: CultureEntry): RowTone {
    if (e.surfaceHa > 0 && e.recolteQty === 0) return "warning"
    return null
  }

  const columns: DataTableColumn<CultureEntry>[] = [
    { key: "date", label: t("production.agriculture.colDate"), render: (e) => formatDate(e.date) },
    { key: "culture", label: t("production.agriculture.colCulture"), render: (e) => <StatusBadge label={e.culture} tone="success" /> },
    { key: "surface", label: t("production.agriculture.colSurface"), render: (e) => formatNumber(e.surfaceHa) },
    { key: "recolte", label: t("production.agriculture.colHarvest"), render: (e) => formatNumber(e.recolteQty) },
    { key: "rendement", label: t("production.agriculture.colYield"), render: (e) => (e.surfaceHa > 0 ? `${(e.recolteQty / e.surfaceHa).toFixed(0)} kg/ha` : "—") },
    { key: "cout", label: t("production.agriculture.colCost"), render: (e) => formatCurrency(e.coutIntrants) },
    { key: "intrants", label: t("production.agriculture.colInputs"), render: (e) => <span className="text-muted-foreground">{e.intrants}</span> },
    {
      key: "actions", label: "", className: "text-right", sticky: true,
      render: (e) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(e)} aria-label={t("common.edit")}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { deleteCulture(e.id); toast.success(t("production.agriculture.toastDeleted")) }} aria-label={t("common.delete")}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Wheat} label={t("production.agriculture.statSurface")} value={`${formatNumber(surfaceTotale)} ha`} tone="primary" />
        <StatCard icon={Wheat} label={t("production.agriculture.statHarvest")} value={`${formatNumber(recolteTotale)} kg`} tone="success" />
        <StatCard icon={Wheat} label={t("production.agriculture.statCost")} value={formatCurrency(coutTotal)} tone="warning" />
      </div>

      <div className="mb-3 flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => setManageOpen(true)} className="gap-2">
          <Settings2 className="h-4 w-4" />
          {t("production.agriculture.manageCulturesButton")}
        </Button>
        <Button onClick={openCreate} className="gap-2">
          <Wheat className="h-4 w-4" />
          {t("production.common.newEntryAlt")}
        </Button>
      </div>

      <DataTable columns={columns} rows={cultures} rowKey={(e) => e.id} isLoading={isLoading} emptyIcon={Wheat} emptyTitle={t("production.agriculture.emptyTitle")} emptyDescription={t("production.agriculture.emptyDescription")} rowTone={rowTone} />

      <AgricultureEntryDialog open={entryOpen} onOpenChange={setEntryOpen} cultures={cultureTypes} editingEntry={editingEntry} onSubmit={handleSubmit} />

      <TypesManagerDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        title={t("production.agriculture.manageCulturesTitle")}
        fields={[{ name: "nom", label: t("production.agriculture.cultureNameLabel"), type: "text" }]}
        items={cultureTypes}
        onAdd={(v) => addCultureType(v.nom as string)}
        onUpdate={(id, v) => updateCultureType(id, v.nom as string)}
        onDelete={removeCultureType}
      />
    </div>
  )
}