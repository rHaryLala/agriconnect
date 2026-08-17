import { useState } from "react"
import { z } from "zod"
import { Plus, Layers, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { QuickAddDialog, type FieldConfig } from "@/components/shared/QuickAddDialog"
import { useCustomTypesStore, type CustomTypeEntry, type CustomProductionType } from "./customTypesStore"
import { formatDate, formatNumber } from "@/lib/format"

const schema = z.object({
  date: z.string().min(1, "Date requise"),
  quantite: z.number({ invalid_type_error: "Nombre requis" }).min(0),
  unite: z.string().min(1, "Unité requise (ex: kg, litres, unités)"),
  notes: z.string().optional().default(""),
})
type FormValues = z.infer<typeof schema>

const fields: FieldConfig<FormValues>[] = [
  { type: "date", name: "date", label: "Date" },
  { type: "number", name: "quantite", label: "Quantité" },
  { type: "text", name: "unite", label: "Unité", placeholder: "kg, litres, unités..." },
  { type: "text", name: "notes", label: "Notes (optionnel)", placeholder: "Observation libre" },
]

interface CustomTypeTabProps {
  type: CustomProductionType
}

export function CustomTypeTab({ type }: CustomTypeTabProps) {
  const { addEntry, deleteEntry } = useCustomTypesStore()
  const [open, setOpen] = useState(false)

  const totalQuantite = type.entries.reduce((sum, e) => sum + e.quantite, 0)

  const columns: DataTableColumn<CustomTypeEntry>[] = [
    { key: "date", label: "Date", render: (e) => formatDate(e.date) },
    { key: "quantite", label: "Quantité", render: (e) => `${formatNumber(e.quantite)} ${e.unite}` },
    { key: "notes", label: "Notes", render: (e) => <span className="text-muted-foreground">{e.notes || "—"}</span> },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (e) => (
        <Button variant="ghost" size="icon" onClick={() => deleteEntry(type.id, e.id)} aria-label="Supprimer">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4">
        <StatCard icon={Layers} label={`Total ${type.label}`} value={formatNumber(totalQuantite)} tone="primary" />
      </div>

      <div className="mb-3 flex justify-end">
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Saisir un relevé
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={type.entries}
        rowKey={(e) => e.id}
        emptyIcon={Layers}
        emptyTitle="Aucun relevé"
        emptyDescription="Saisis le premier relevé avec le bouton ci-dessus."
      />

      <QuickAddDialog
        open={open}
        onOpenChange={setOpen}
        title={`Nouveau relevé — ${type.label}`}
        schema={schema}
        fields={fields}
        defaultValues={{ date: new Date().toISOString().slice(0, 10), quantite: 0, unite: "", notes: "" }}
        onSubmit={(values) => addEntry(type.id, values)}
      />
    </div>
  )
}