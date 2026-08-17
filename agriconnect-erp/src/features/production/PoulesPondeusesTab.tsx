import { useEffect, useState } from "react"
import { z } from "zod"
import { Plus, Egg, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { QuickAddDialog, type FieldConfig } from "@/components/shared/QuickAddDialog"
import { useProductionStore } from "./productionStore"
import { formatDate, formatNumber } from "@/lib/format"
import type { PouleEntry } from "@/types/production"

const schema = z.object({
  date: z.string().min(1, "Date requise"),
  nbPoules: z.number({ invalid_type_error: "Nombre requis" }).positive("Doit être positif"),
  oeufsJour: z.number({ invalid_type_error: "Nombre requis" }).min(0, "Ne peut pas être négatif"),
  alimentsKg: z.number({ invalid_type_error: "Nombre requis" }).min(0),
  mortalite: z.number({ invalid_type_error: "Nombre requis" }).min(0),
})
type FormValues = z.infer<typeof schema>

const fields: FieldConfig<FormValues>[] = [
  { type: "date", name: "date", label: "Date" },
  { type: "number", name: "nbPoules", label: "Nombre de poules" },
  { type: "number", name: "oeufsJour", label: "Œufs produits" },
  { type: "number", name: "alimentsKg", label: "Aliments consommés", unit: "kg" },
  { type: "number", name: "mortalite", label: "Mortalité (pertes)" },
]

export function PoulesPondeusesTab() {
  const { poules, isLoading, fetchAll, addPoule, deletePoule } = useProductionStore()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const latest = poules[0]
  const tauxPonte = latest && latest.nbPoules > 0 ? (latest.oeufsJour / latest.nbPoules) * 100 : 0
  const mortaliteCumulee = poules.reduce((sum, e) => sum + e.mortalite, 0)

  const columns: DataTableColumn<PouleEntry>[] = [
    { key: "date", label: "Date", render: (e) => formatDate(e.date) },
    { key: "nbPoules", label: "Poules", render: (e) => formatNumber(e.nbPoules) },
    { key: "oeufsJour", label: "Œufs", render: (e) => formatNumber(e.oeufsJour) },
    { key: "taux", label: "Taux de ponte", render: (e) => `${((e.oeufsJour / e.nbPoules) * 100).toFixed(1)} %` },
    { key: "aliments", label: "Aliments", render: (e) => `${formatNumber(e.alimentsKg)} kg` },
    { key: "mortalite", label: "Mortalité", render: (e) => formatNumber(e.mortalite) },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (e) => (
        <Button variant="ghost" size="icon" onClick={() => deletePoule(e.id)} aria-label="Supprimer">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Egg} label="Poules (dernier relevé)" value={latest ? formatNumber(latest.nbPoules) : "—"} tone="primary" />
        <StatCard icon={Egg} label="Taux de ponte" value={`${tauxPonte.toFixed(1)} %`} tone="success" />
        <StatCard icon={Egg} label="Mortalité cumulée" value={formatNumber(mortaliteCumulee)} tone="warning" />
      </div>

      <div className="mb-3 flex justify-end">
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Saisir un relevé
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={poules}
        rowKey={(e) => e.id}
        isLoading={isLoading}
        emptyIcon={Egg}
        emptyTitle="Aucun relevé"
        emptyDescription="Saisis le premier relevé avec le bouton ci-dessus."
      />

      <QuickAddDialog
        open={open}
        onOpenChange={setOpen}
        title="Nouveau relevé — Poules pondeuses"
        schema={schema}
        fields={fields}
        defaultValues={{ date: new Date().toISOString().slice(0, 10), nbPoules: 0, oeufsJour: 0, alimentsKg: 0, mortalite: 0 }}
        onSubmit={addPoule}
      />
    </div>
  )
}