import { useEffect, useState } from "react"
import { z } from "zod"
import { Plus, Bird, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { QuickAddDialog, type FieldConfig } from "@/components/shared/QuickAddDialog"
import { useProductionStore } from "./productionStore"
import { formatDate, formatNumber } from "@/lib/format"
import type { KuroilerEntry, CycleEtape } from "@/types/production"

const schema = z.object({
  date: z.string().min(1, "Date requise"),
  kgViande: z.number({ invalid_type_error: "Nombre requis" }).min(0),
  poussinsVendus: z.number({ invalid_type_error: "Nombre requis" }).min(0),
  oeufsProduits: z.number({ invalid_type_error: "Nombre requis" }).min(0),
  etapeCycle: z.enum(["demarrage", "croissance", "fin_cycle"], { errorMap: () => ({ message: "Sélectionne une étape" }) }),
})
type FormValues = z.infer<typeof schema>

const fields: FieldConfig<FormValues>[] = [
  { type: "date", name: "date", label: "Date" },
  { type: "number", name: "kgViande", label: "Production de viande", unit: "kg" },
  { type: "number", name: "poussinsVendus", label: "Poussins vendus" },
  { type: "number", name: "oeufsProduits", label: "Œufs produits" },
  {
    type: "select",
    name: "etapeCycle",
    label: "Étape du cycle",
    options: [
      { value: "demarrage", label: "Démarrage" },
      { value: "croissance", label: "Croissance" },
      { value: "fin_cycle", label: "Fin de cycle" },
    ],
  },
]

const ETAPE_LABELS: Record<CycleEtape, string> = {
  demarrage: "Démarrage",
  croissance: "Croissance",
  fin_cycle: "Fin de cycle",
}
const ETAPE_TONES: Record<CycleEtape, "info" | "warning" | "success"> = {
  demarrage: "info",
  croissance: "warning",
  fin_cycle: "success",
}

export function PoulesKuroilerTab() {
  const { kuroiler, isLoading, fetchAll, addKuroiler, deleteKuroiler } = useProductionStore()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const kgViandeCumule = kuroiler.reduce((sum, e) => sum + e.kgViande, 0)
  const poussinsCumules = kuroiler.reduce((sum, e) => sum + e.poussinsVendus, 0)

  const columns: DataTableColumn<KuroilerEntry>[] = [
    { key: "date", label: "Date", render: (e) => formatDate(e.date) },
    { key: "viande", label: "Viande (kg)", render: (e) => formatNumber(e.kgViande) },
    { key: "poussins", label: "Poussins vendus", render: (e) => formatNumber(e.poussinsVendus) },
    { key: "oeufs", label: "Œufs", render: (e) => formatNumber(e.oeufsProduits) },
    { key: "etape", label: "Étape", render: (e) => <StatusBadge label={ETAPE_LABELS[e.etapeCycle]} tone={ETAPE_TONES[e.etapeCycle]} /> },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (e) => (
        <Button variant="ghost" size="icon" onClick={() => deleteKuroiler(e.id)} aria-label="Supprimer">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Bird} label="Viande cumulée" value={`${formatNumber(kgViandeCumule)} kg`} tone="primary" />
        <StatCard icon={Bird} label="Poussins vendus (cumulé)" value={formatNumber(poussinsCumules)} tone="success" />
      </div>

      <div className="mb-3 flex justify-end">
        <Button onClick={() => setOpen(true)} className="gap-2">
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
      />

      <QuickAddDialog
        open={open}
        onOpenChange={setOpen}
        title="Nouveau relevé — Poules Kuroiler"
        schema={schema}
        fields={fields}
        defaultValues={{ date: new Date().toISOString().slice(0, 10), kgViande: 0, poussinsVendus: 0, oeufsProduits: 0, etapeCycle: "demarrage" }}
        onSubmit={addKuroiler}
      />
    </div>
  )
}