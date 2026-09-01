import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { Plus, Bird, Trash2, Pencil, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { QuickAddDialog, type FieldConfig } from "@/components/shared/QuickAddDialog"
import { TypesManagerDialog } from "@/components/shared/TypesManagerDialog"
import { useProductionStore } from "./productionStore"
import { useCycleEtapesStore } from "./cycleEtapesStore"
import { formatDate, formatNumber } from "@/lib/format"
import { hasAlertKeyword, type RowTone } from "@/lib/alerts"
import type { KuroilerEntry } from "@/types/production"

export function PoulesKuroilerTab() {
  const { t } = useTranslation()
  const { kuroiler, isLoading, fetchAll, addKuroiler, updateKuroiler, deleteKuroiler } = useProductionStore()
  const { etapes, addEtape, updateEtape, removeEtape } = useCycleEtapesStore()
  const [open, setOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<KuroilerEntry | null>(null)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const schema = useMemo(
    () =>
      z.object({
        date: z.string().min(1, t("stock.movements.validationDate")),
        kgViande: z.number({ error: t("stock.inventory.validationNumber") }).min(0),
        poussinsVendus: z.number({ error: t("stock.inventory.validationNumber") }).min(0),
        oeufsProduits: z.number({ error: t("stock.inventory.validationNumber") }).min(0),
        etapeCycle: z.string().min(1, t("production.kuroiler.validationStage")),
        observation: z.string().min(1, t("production.vaches.validationObservation")),
      }),
    [t]
  )
  type FormValues = z.infer<typeof schema>

  const fields: FieldConfig<FormValues>[] = useMemo(
    () => [
      { type: "date", name: "date", label: t("production.common.date") },
      { type: "number", name: "kgViande", label: t("production.kuroiler.fieldMeat"), unit: "kg" },
      { type: "number", name: "poussinsVendus", label: t("production.kuroiler.fieldChicks") },
      { type: "number", name: "oeufsProduits", label: t("production.kuroiler.fieldEggs") },
      { type: "select", name: "etapeCycle", label: t("production.kuroiler.fieldStage"), options: etapes.map((e) => ({ value: e.nom, label: e.nom })) },
      { type: "text", name: "observation", label: t("production.common.observation"), placeholder: t("production.common.observationPlaceholder") },
    ],
    [t, etapes]
  )

  const kgViandeCumule = kuroiler.reduce((sum, e) => sum + e.kgViande, 0)
  const poussinsCumules = kuroiler.reduce((sum, e) => sum + e.poussinsVendus, 0)

  function openCreate() {
    setEditingEntry(null)
    setOpen(true)
  }
  function openEdit(entry: KuroilerEntry) {
    setEditingEntry(entry)
    setOpen(true)
  }

  async function handleSubmit(values: FormValues) {
    if (editingEntry) {
      await updateKuroiler(editingEntry.id, values)
      toast.success(t("production.kuroiler.toastModified"))
    } else {
      await addKuroiler(values)
      toast.success(t("production.kuroiler.toastCreated"))
    }
  }

  function rowTone(e: KuroilerEntry): RowTone {
    return hasAlertKeyword(e.observation) ? "critical" : null
  }

  const columns: DataTableColumn<KuroilerEntry>[] = [
    { key: "date", label: t("production.kuroiler.colDate"), render: (e) => formatDate(e.date) },
    { key: "viande", label: t("production.kuroiler.colMeat"), render: (e) => formatNumber(e.kgViande) },
    { key: "poussins", label: t("production.kuroiler.colChicks"), render: (e) => formatNumber(e.poussinsVendus) },
    { key: "oeufs", label: t("production.kuroiler.colEggs"), render: (e) => formatNumber(e.oeufsProduits) },
    { key: "etape", label: t("production.kuroiler.colStage"), render: (e) => <StatusBadge label={e.etapeCycle} tone="info" /> },
    { key: "observation", label: t("production.vaches.colObservation"), render: (e) => <span className="text-muted-foreground">{e.observation}</span> },
    {
      key: "actions", label: "", className: "text-right", sticky: true,
      render: (e) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(e)} aria-label={t("common.edit")}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { deleteKuroiler(e.id); toast.success(t("production.kuroiler.toastDeleted")) }} aria-label={t("common.delete")}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Bird} label={t("production.kuroiler.statMeat")} value={`${formatNumber(kgViandeCumule)} kg`} tone="primary" />
        <StatCard icon={Bird} label={t("production.kuroiler.statChicks")} value={formatNumber(poussinsCumules)} tone="success" />
      </div>

      <div className="mb-3 flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => setManageOpen(true)} className="gap-2">
          <Settings2 className="h-4 w-4" />
          {t("production.common.manageStagesButton")}
        </Button>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("production.common.newEntry")}
        </Button>
      </div>

      <DataTable columns={columns} rows={kuroiler} rowKey={(e) => e.id} isLoading={isLoading} emptyIcon={Bird} emptyTitle={t("production.kuroiler.emptyTitle")} emptyDescription={t("production.kuroiler.emptyDescription")} rowTone={rowTone} />

      <QuickAddDialog
        open={open}
        onOpenChange={setOpen}
        title={editingEntry ? t("production.kuroiler.dialogTitleEdit") : t("production.kuroiler.dialogTitleNew")}
        schema={schema}
        fields={fields}
        defaultValues={editingEntry ?? { date: new Date().toISOString().slice(0, 10), kgViande: 0, poussinsVendus: 0, oeufsProduits: 0, etapeCycle: etapes[0]?.nom ?? "", observation: "" }}
        onSubmit={handleSubmit}
      />

      <TypesManagerDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        title={t("production.common.manageStagesTitle")}
        fields={[{ name: "nom", label: t("production.common.stageNameLabel"), type: "text" }]}
        items={etapes}
        onAdd={(v) => addEtape(v.nom as string)}
        onUpdate={(id, v) => updateEtape(id, v.nom as string)}
        onDelete={removeEtape}
      />
    </div>
  )
}