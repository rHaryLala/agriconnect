import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { Plus, Fuel, Pencil, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { QuickAddDialog, type FieldConfig } from "@/components/shared/QuickAddDialog"
import { TypesManagerDialog } from "@/components/shared/TypesManagerDialog"
import { useCarburantStore } from "./carburantStore"
import { useEnginsStore } from "./enginsStore"
import { computeStockCarburant, consommationParEngin, sumSurPeriode } from "@/lib/carburantCalc"
import { currentIsoDate, periodBounds, type Periodicity } from "@/lib/dateRange"
import { formatDate, formatNumber } from "@/lib/format"
import { CARBURANT_MOUVEMENT_TYPES, type CarburantMouvement, type CarburantMouvementType } from "@/types/production"
import { ConfirmDeleteButton } from "@/components/shared/ConfirmDeleteButton"

const PERIODICITIES: Periodicity[] = ["month", "year"]
const PERIODICITY_LABEL_KEYS: Record<Periodicity, string> = {
  day: "rapports.periodicityDay",
  week: "rapports.periodicityWeek",
  month: "rapports.periodicityMonth",
  year: "rapports.periodicityYear",
}

const TYPE_LABEL_KEYS: Record<CarburantMouvementType, string> = {
  entree: "production.carburant.typeEntry",
  sortie: "production.carburant.typeExit",
}

type FormValues = { date: string; type: string; quantiteLitres: number; engin: string; observation: string }

export function CarburantTab({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation()
  const { mouvements, isLoading, fetchAll, addMouvement, updateMouvement, deleteMouvement } = useCarburantStore()
  const engins = useEnginsStore()
  const [entryOpen, setEntryOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<CarburantMouvement | null>(null)
  const [periodicity, setPeriodicity] = useState<Periodicity>("month")

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const period = useMemo(() => periodBounds(periodicity, currentIsoDate()), [periodicity])
  const stock = computeStockCarburant(mouvements)
  const entrees = sumSurPeriode(mouvements, "entree", period.start, period.end)
  const sorties = sumSurPeriode(mouvements, "sortie", period.start, period.end)
  const parEngin = consommationParEngin(mouvements, period.start, period.end)

  const schema = useMemo(
    () =>
      z
        .object({
          date: z.string().min(1, t("stock.movements.validationDate")),
          type: z.string().min(1, t("stock.movements.validationType")),
          quantiteLitres: z.number({ error: t("stock.inventory.validationNumber") }).positive(t("stock.movements.validationQuantity")),
          engin: z.string(),
          observation: z.string(),
        })
        .refine((v) => v.type !== "sortie" || !!v.engin, {
          message: t("production.carburant.validationMachine"),
          path: ["engin"],
        }),
    [t]
  )

  const fields: FieldConfig<FormValues>[] = useMemo(
    () => [
      { type: "date", name: "date", label: t("production.common.date") },
      {
        type: "select",
        name: "type",
        label: t("stock.movements.fieldType"),
        options: CARBURANT_MOUVEMENT_TYPES.map((value) => ({ value, label: t(TYPE_LABEL_KEYS[value]) })),
      },
      { type: "number", name: "quantiteLitres", label: t("production.carburant.fieldQuantity"), unit: "L" },
      { type: "select", name: "engin", label: t("production.carburant.fieldMachine"), options: engins.types.map((e) => ({ value: e.nom, label: e.nom })) },
      { type: "text", name: "observation", label: t("production.common.observation"), placeholder: t("production.common.observationPlaceholder") },
    ],
    [t, engins.types]
  )

  async function handleSubmit(values: FormValues) {
    const payload: Omit<CarburantMouvement, "id"> = {
      date: values.date,
      type: values.type as CarburantMouvementType,
      quantiteLitres: values.quantiteLitres,
      engin: values.type === "sortie" ? values.engin : "",
      observation: values.observation,
    }
    if (editingEntry) {
      await updateMouvement(editingEntry.id, payload)
      toast.success(t("production.carburant.toastModified"))
    } else {
      await addMouvement(payload)
      toast.success(t("production.carburant.toastCreated"))
    }
  }

  const columns: DataTableColumn<CarburantMouvement>[] = [
    { key: "date", label: t("production.common.date"), render: (m) => formatDate(m.date) },
    {
      key: "type",
      label: t("stock.movements.fieldType"),
      render: (m) => <StatusBadge label={t(TYPE_LABEL_KEYS[m.type])} tone={m.type === "entree" ? "success" : "warning"} />,
    },
    { key: "quantite", label: t("production.carburant.fieldQuantity"), render: (m) => `${formatNumber(m.quantiteLitres)} L` },
    { key: "engin", label: t("production.carburant.fieldMachine"), render: (m) => m.engin || <span className="text-muted-foreground">—</span> },
    { key: "observation", label: t("production.common.observation"), render: (m) => <span className="text-muted-foreground">{m.observation}</span> },
    ...(canEdit
      ? [{
          key: "actions",
          label: "",
          className: "text-right",
          sticky: true,
          render: (m: CarburantMouvement) => (
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditingEntry(m)
                  setEntryOpen(true)
                }}
                aria-label={t("common.edit")}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <ConfirmDeleteButton
                onConfirm={() => {
                  deleteMouvement(m.id)
                  toast.success(t("production.carburant.toastDeleted"))
                }}
              />
            </div>
          ),
        } as DataTableColumn<CarburantMouvement>]
      : []),
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Fuel} label={t("production.carburant.statStock")} value={`${formatNumber(stock)} L`} tone={stock < 0 ? "destructive" : "primary"} />
        <StatCard icon={Fuel} label={t("production.carburant.statEntries")} value={`${formatNumber(entrees)} L`} tone="success" />
        <StatCard icon={Fuel} label={t("production.carburant.statExits")} value={`${formatNumber(sorties)} L`} tone="warning" />
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          {PERIODICITIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriodicity(p)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-200 ${periodicity === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t(PERIODICITY_LABEL_KEYS[p])}
            </button>
          ))}
        </div>

        {canEdit && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setManageOpen(true)} className="gap-2">
              <Settings2 className="h-4 w-4" />
              {t("production.carburant.manageMachines")}
            </Button>
            <Button
              onClick={() => {
                setEditingEntry(null)
                setEntryOpen(true)
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("production.carburant.newMovement")}
            </Button>
          </div>
        )}
      </div>

      {parEngin.length > 0 && (
        <div className="mb-4 rounded-xl border border-border bg-surface p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">{t("production.carburant.breakdownTitle")}</p>
          <ul className="flex flex-col gap-2">
            {parEngin.map((row) => (
              <li key={row.engin} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-foreground">{row.engin}</span>
                <span className="text-muted-foreground">
                  {t("production.carburant.breakdownLine", { litres: formatNumber(row.litres), count: row.sorties })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={mouvements}
        rowKey={(m) => m.id}
        isLoading={isLoading}
        emptyIcon={Fuel}
        emptyTitle={t("production.carburant.emptyTitle")}
        emptyDescription={t("production.carburant.emptyDescription")}
      />

      {canEdit && (
        <>
          <QuickAddDialog
            open={entryOpen}
            onOpenChange={setEntryOpen}
            title={editingEntry ? t("production.carburant.dialogTitleEdit") : t("production.carburant.dialogTitleNew")}
            schema={schema}
            fields={fields}
            defaultValues={
              editingEntry
                ? {
                    date: editingEntry.date,
                    type: editingEntry.type,
                    quantiteLitres: editingEntry.quantiteLitres,
                    engin: editingEntry.engin,
                    observation: editingEntry.observation,
                  }
                : { date: currentIsoDate(), type: "sortie", quantiteLitres: 0, engin: engins.types[0]?.nom ?? "", observation: "" }
            }
            onSubmit={handleSubmit}
          />
          <TypesManagerDialog
            open={manageOpen}
            onOpenChange={setManageOpen}
            title={t("production.carburant.manageMachinesTitle")}
            fields={[{ name: "nom", label: t("production.carburant.fieldMachine"), type: "text" }]}
            items={engins.types}
            onAdd={(v) => engins.addType(v.nom as string)}
            onUpdate={(id, v) => engins.updateType(id, v.nom as string)}
            onDelete={engins.removeType}
          />
        </>
      )}
    </div>
  )
}
