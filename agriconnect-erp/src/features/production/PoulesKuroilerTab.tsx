import { useEffect, useState } from "react"
import { toast } from "sonner"
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
import { z } from "zod"

const schema = z.object({
  date: z.string().min(1, "Date requise"),
  kgViande: z.number({ invalid_type_error: "Nombre requis" }).min(0),
  poussinsVendus: z.number({ invalid_type_error: "Nombre requis" }).min(0),
  oeufsProduits: z.number({ invalid_type_error: "Nombre requis" }).min(0),
  etapeCycle: z.string().min(1, "Sélectionne une étape"),
  observation: z.string().min(1, "Renseigne une observation, même 'RAS'"),
})
type FormValues = z.infer<typeof schema>

export function PoulesKuroilerTab() {
  const { kuroiler, isLoading, fetchAll, addKuroiler, updateKuroiler, deleteKuroiler } = useProductionStore()
  const { etapes, addEtape, updateEtape, removeEtape } = useCycleEtapesStore()
  const [open, setOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<KuroilerEntry | null>(null)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

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
      toast.success("Relevé modifié")
    } else {
      await addKuroiler(values)
      toast.success("Relevé enregistré")
    }
  }

  function rowTone(e: KuroilerEntry): RowTone {
    return hasAlertKeyword(e.observation) ? "critical" : null
  }

  const fields: FieldConfig<FormValues>[] = [
    { type: "date", name: "date", label: "Date" },
    { type: "number", name: "kgViande", label: "Production de viande", unit: "kg" },
    { type: "number", name: "poussinsVendus", label: "Poussins vendus" },
    { type: "number", name: "oeufsProduits", label: "Œufs produits" },
    { type: "select", name: "etapeCycle", label: "Étape du cycle", options: etapes.map((e) => ({ value: e.nom, label: e.nom })) },
    { type: "text", name: "observation", label: "Observation", placeholder: "RAS, ou observation" },
  ]

  const columns: DataTableColumn<KuroilerEntry>[] = [
    { key: "date", label: "Date", render: (e) => formatDate(e.date) },
    { key: "viande", label: "Viande (kg)", render: (e) => formatNumber(e.kgViande) },
    { key: "poussins", label: "Poussins vendus", render: (e) => formatNumber(e.poussinsVendus) },
    { key: "oeufs", label: "Œufs", render: (e) => formatNumber(e.oeufsProduits) },
    { key: "etape", label: "Étape", render: (e) => <StatusBadge label={e.etapeCycle} tone="info" /> },
    { key: "observation", label: "Observation", render: (e) => <span className="text-muted-foreground">{e.observation}</span> },
    {
      key: "actions",
      label: "",
      className: "text-right",
      sticky: true,
      render: (e) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(e)} aria-label="Modifier">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { deleteKuroiler(e.id); toast.success("Relevé supprimé") }} aria-label="Supprimer">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Bird} label="Viande cumulée" value={`${formatNumber(kgViandeCumule)} kg`} tone="primary" />
        <StatCard icon={Bird} label="Poussins vendus (cumulé)" value={formatNumber(poussinsCumules)} tone="success" />
      </div>

      <div className="mb-3 flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => setManageOpen(true)} className="gap-2">
          <Settings2 className="h-4 w-4" />
          Gérer les étapes
        </Button>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Saisir un relevé
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={kuroiler}
        rowKey={(e) => e.id}
        isLoading={isLoading}
        emptyIcon={Bird}
        emptyTitle="Aucun relevé"
        emptyDescription="Saisis le premier relevé avec le bouton ci-dessus."
        rowTone={rowTone}
      />

      <QuickAddDialog
        open={open}
        onOpenChange={setOpen}
        title={editingEntry ? "Modifier le relevé — Poules Kuroiler" : "Nouveau relevé — Poules Kuroiler"}
        schema={schema}
        fields={fields}
        defaultValues={
          editingEntry ?? {
            date: new Date().toISOString().slice(0, 10),
            kgViande: 0,
            poussinsVendus: 0,
            oeufsProduits: 0,
            etapeCycle: etapes[0]?.nom ?? "",
            observation: "",
          }
        }
        onSubmit={handleSubmit}
      />

      <TypesManagerDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        title="Gérer les étapes du cycle"
        fields={[{ name: "nom", label: "Nom de l'étape", type: "text" }]}
        items={etapes}
        onAdd={(v) => addEtape(v.nom as string)}
        onUpdate={(id, v) => updateEtape(id, v.nom as string)}
        onDelete={removeEtape}
      />
    </div>
  )
}