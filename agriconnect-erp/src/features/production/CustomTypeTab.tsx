import { useState } from "react"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { Plus, Layers, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { QuickAddDialog, type FieldConfig } from "@/components/shared/QuickAddDialog"
import { useCustomTypesStore, type CustomTypeEntry, type CustomProductionType } from "./customTypesStore"
import { UNIT_OPTIONS } from "@/lib/units"
import { formatDate, formatNumber } from "@/lib/format"
import { toast } from "sonner"

interface CustomTypeTabProps {
  type: CustomProductionType
}

export function CustomTypeTab({ type }: CustomTypeTabProps) {
  const { t } = useTranslation()
  const { addEntry, deleteEntry } = useCustomTypesStore()
  const [open, setOpen] = useState(false)

  const schema = z.object({
    date: z.string().min(1, t("stock.movements.validationDate")),
    quantite: z.number({ error: t("stock.inventory.validationNumber") }).min(0, t("stock.inventory.validationMin")),
    unite: z.string().min(1, t("production.customType.validationUnit")),
    notes: z.string(),
  })
  type FormValues = z.infer<typeof schema>

  const fields: FieldConfig<FormValues>[] = [
    { 
      type: "date", 
      name: "date", 
      label: t("production.common.date") 
    },
    { 
      type: "number", 
      name: "quantite", 
      label: t("production.customType.fieldQuantity"),
      placeholder: t("production.customType.fieldQuantityPlaceholder", { defaultValue: "0" })
    },
    { 
      type: "select", 
      name: "unite", 
      label: t("production.customType.fieldUnit"), 
      options: UNIT_OPTIONS,
      placeholder: t("production.customType.fieldUnitPlaceholder")
    },
    { 
      type: "text", 
      name: "notes", 
      label: t("production.customType.fieldNotes"), 
      placeholder: t("production.customType.fieldNotesPlaceholder"),
      required: false
    },
  ]

  const totalQuantite = type.entries.reduce((sum, e) => sum + e.quantite, 0)

  const columns: DataTableColumn<CustomTypeEntry>[] = [
    { 
      key: "date", 
      label: t("production.customType.colDate"), 
      render: (e) => formatDate(e.date) 
    },
    { 
      key: "quantite", 
      label: t("production.customType.colQuantity"), 
      render: (e) => `${formatNumber(e.quantite)} ${e.unite}` 
    },
    { 
      key: "notes", 
      label: t("production.customType.colNotes"), 
      render: (e) => (
        <span className="text-muted-foreground">
          {e.notes || "—"}
        </span>
      ) 
    },
    {
      key: "actions", 
      label: "", 
      className: "text-right", 
      sticky: true,
      render: (e) => (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => deleteEntry(type.id, e.id)} 
          aria-label={t("common.delete")}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4">
        <StatCard 
          icon={Layers} 
          label={t("production.customType.statTotal", { label: type.label })} 
          value={formatNumber(totalQuantite)} 
          tone="primary" 
        />
      </div>

      <div className="mb-3 flex justify-end">
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("production.common.newEntry")}
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        rows={type.entries} 
        rowKey={(e) => e.id} 
        emptyIcon={Layers} 
        emptyTitle={t("production.customType.emptyTitle")} 
        emptyDescription={t("production.customType.emptyDescription")} 
      />

      <QuickAddDialog
        open={open}
        onOpenChange={setOpen}
        title={t("production.customType.dialogTitle", { label: type.label })}
        schema={schema}
        fields={fields}
        defaultValues={{ 
          date: new Date().toISOString().slice(0, 10), 
          quantite: 0, 
          unite: "", 
          notes: "" 
        }}
        onSubmit={async (values) => {
          await addEntry(type.id, values)
          toast.success(t("production.customType.toastCreated"))
        }}
      />
    </div>
  )
}