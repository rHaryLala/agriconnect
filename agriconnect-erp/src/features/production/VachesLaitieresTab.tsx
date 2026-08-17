import { useEffect, useState } from "react"
import { z } from "zod"
import { Plus, Milk, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { QuickAddDialog, type FieldConfig } from "@/components/shared/QuickAddDialog"
import { useProductionStore } from "./productionStore"
import { formatDate, formatNumber } from "@/lib/format"
import type { VacheEntry } from "@/types/production"

const schema = z.object({
  date: z.string().min(1, "Date requise"),
  nbVaches: z.number({ invalid_type_error: "Nombre requis" }).positive("Doit être positif"),
  litresJour: z.number({ invalid_type_error: "Nombre requis" }).min(0),
  suiviSanitaire: z.string().min(1, "Renseigne une observation, même 'RAS'"),
  alimentationKg: z.number({ invalid_type_error: "Nombre requis" }).min(0),
})
type FormValues = z.infer<typeof schema>

const fields: FieldConfig<FormValues>[] = [
  { type: "date", name: "date", label: "Date" },
  { type: "number", name: "nbVaches", label: "Nombre de vaches" },
  { type: "number", name: "litresJour", label: "Production de lait", unit: "litres" },
  { type: "text", name: "suiviSanitaire", label: "Suivi sanitaire", placeholder: "RAS, ou observation" },
  { type: "number", name: "alimentationKg", label: "Alimentation", unit: "kg" },
]

export function VachesLaitieresTab() {
  const { vaches, isLoading, fetchAll, addVache, deleteVache } = useProductionStore()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const latest = vaches[0]
  const litresCumules = vaches.reduce((sum, e) => sum + e.litresJour, 0)

  const columns: DataTableColumn<VacheEntry>[] = [
    { key: "date", label: "Date", render: (e) => formatDate(e.date) },
    { key: "nbVaches", label: "Vaches", render: (e) => formatNumber(e.nbVaches) },
    { key: "litres", label: "Lait (L)", render: (e) => formatNumber(e.litresJour) },
    { key: "sanitaire", label: "Suivi sanitaire", render: (e) => <span className="text-muted-foreground">{e.suiviSanitaire}</span> },
    { key: "alimentation", label: "Alimentation", render: (e) => `${formatNumber(e.alimentationKg)} kg` },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (e) => (
        <Button variant="ghost" size="icon" onClick={() => deleteVache(e.id)} aria-label="Supprimer">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Milk} label="Vaches (dernier relevé)" value={latest ? formatNumber(latest.nbVaches) : "—"} tone="primary" />
        <StatCard icon={Milk} label="Lait cumulé" value={`${formatNumber(litresCumules)} L`} tone="success" />
      </div>

      <div className="mb-3 flex justify-end">
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Saisir un relevé
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={vaches}
        rowKey={(e) => e.id}
        isLoading={isLoading}
        emptyIcon={Milk}
        emptyTitle="Aucun relevé"
        emptyDescription="Saisis le premier relevé avec le bouton ci-dessus."
      />

      <QuickAddDialog
        open={open}
        onOpenChange={setOpen}
        title="Nouveau relevé — Vaches laitières"
        schema={schema}
        fields={fields}
        defaultValues={{ date: new Date().toISOString().slice(0, 10), nbVaches: 0, litresJour: 0, suiviSanitaire: "", alimentationKg: 0 }}
        onSubmit={addVache}
      />
    </div>
  )
}