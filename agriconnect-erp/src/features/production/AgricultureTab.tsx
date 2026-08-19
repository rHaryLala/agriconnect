import { useEffect, useState } from "react"
import { z } from "zod"
import { Plus, Wheat, Trash2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import {
  QuickAddDialog,
  type FieldConfig,
} from "@/components/shared/QuickAddDialog"
import { TypesManagerDialog } from "@/components/shared/TypesManagerDialog"
import { useProductionStore } from "./productionStore"
import { useCultureTypesStore } from "./cultureTypesStore"
import { formatDate, formatNumber } from "@/lib/format"
import type { CultureEntry } from "@/types/production"

const schema = z.object({
  date: z.string().min(1, "Date requise"),

  culture: z.string().min(1, "Sélectionne une culture"),

  surfaceHa: z
    .number({ invalid_type_error: "Nombre requis" })
    .positive("Doit être positif"),

  semisQty: z
    .number({ invalid_type_error: "Nombre requis" })
    .min(0),

  recolteQty: z
    .number({ invalid_type_error: "Nombre requis" })
    .min(0),

  intrants: z
    .string()
    .min(1, "Renseigne les intrants utilisés, même 'aucun'"),
})

type FormValues = z.infer<typeof schema>

export function AgricultureTab() {
  const {
    cultures,
    isLoading,
    fetchAll,
    addCulture,
    deleteCulture,
  } = useProductionStore()

  const {
    types: cultureTypes,
    addType: addCultureType,
    updateType: updateCultureType,
    removeType: removeCultureType,
  } = useCultureTypesStore()

  const [open, setOpen] = useState(false)
  const [addTypeOpen, setAddTypeOpen] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const surfaceTotale = cultures.reduce(
    (sum, e) => sum + e.surfaceHa,
    0
  )

  const recolteTotale = cultures.reduce(
    (sum, e) => sum + e.recolteQty,
    0
  )

  const fields: FieldConfig<FormValues>[] = [
    {
      type: "date",
      name: "date",
      label: "Date",
    },
    {
      type: "select",
      name: "culture",
      label: "Culture",
      options: cultureTypes.map((c) => ({
        value: c.nom,
        label: c.nom,
      })),
    },
    {
      type: "number",
      name: "surfaceHa",
      label: "Surface",
      unit: "ha",
      step: "0.1",
    },
    {
      type: "number",
      name: "semisQty",
      label: "Semis",
      unit: "kg",
    },
    {
      type: "number",
      name: "recolteQty",
      label: "Récolte",
      unit: "kg",
    },
    {
      type: "text",
      name: "intrants",
      label: "Intrants utilisés",
      placeholder: "Engrais NPK, semences...",
    },
  ]

  const columns: DataTableColumn<CultureEntry>[] = [
    {
      key: "date",
      label: "Date",
      render: (e) => formatDate(e.date),
    },
    {
      key: "culture",
      label: "Culture",
      render: (e) => (
        <StatusBadge
          label={e.culture}
          tone="success"
        />
      ),
    },
    {
      key: "surface",
      label: "Surface (ha)",
      render: (e) => formatNumber(e.surfaceHa),
    },
    {
      key: "recolte",
      label: "Récolte (kg)",
      render: (e) => formatNumber(e.recolteQty),
    },
    {
      key: "rendement",
      label: "Rendement",
      render: (e) =>
        e.surfaceHa > 0
          ? `${(e.recolteQty / e.surfaceHa).toFixed(0)} kg/ha`
          : "—",
    },
    {
      key: "intrants",
      label: "Intrants",
      render: (e) => (
        <span className="text-muted-foreground">
          {e.intrants}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "sticky right-0 z-10 bg-background text-right",
      sticky: true,
      render: (e) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            deleteCulture(e.id)
          }}
          aria-label="Supprimer"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard
          icon={Wheat}
          label="Surface cultivée"
          value={`${formatNumber(surfaceTotale)} ha`}
          tone="primary"
        />

        <StatCard
          icon={Wheat}
          label="Récolte cumulée"
          value={`${formatNumber(recolteTotale)} kg`}
          tone="success"
        />
      </div>

      <div className="mb-3 flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setAddTypeOpen(true)}
          className="gap-2"
        >
          <Pencil className="h-4 w-4" />
          Gérer les cultures
        </Button>

        <Button
          onClick={() => setOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Saisir une entrée
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={cultures}
        rowKey={(e) => e.id}
        isLoading={isLoading}
        emptyIcon={Wheat}
        emptyTitle="Aucune entrée"
        emptyDescription="Saisis la première entrée avec le bouton ci-dessus."
      />

      <QuickAddDialog
        open={open}
        onOpenChange={setOpen}
        title="Nouvelle entrée — Agriculture"
        schema={schema}
        fields={fields}
        defaultValues={{
          date: new Date().toISOString().slice(0, 10),
          culture: cultureTypes[0]?.nom ?? "",
          surfaceHa: 0,
          semisQty: 0,
          recolteQty: 0,
          intrants: "",
        }}
        onSubmit={addCulture}
      />

      <TypesManagerDialog
        open={addTypeOpen}
        onOpenChange={setAddTypeOpen}
        title="Gérer les types de culture"
        fields={[
          {
            name: "nom",
            label: "Nom de la culture",
            type: "text",
          },
        ]}
        items={cultureTypes}
        onAdd={(v) =>
          addCultureType(v.nom as string)
        }
        onUpdate={(id, v) =>
          updateCultureType(id, v.nom as string)
        }
        onDelete={removeCultureType}
      />
    </div>
  )
}