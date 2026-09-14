import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { Plus, Sprout, Trash2, Pencil, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { QuickAddDialog, type FieldConfig } from "@/components/shared/QuickAddDialog"
import { TypesManagerDialog } from "@/components/shared/TypesManagerDialog"
import { useEngraisStore } from "./engraisStore"
import { useEngraisTypesStore } from "./engraisTypesStore"
import { useCultureTypesStore } from "./cultureTypesStore"
import { totalEngrais, totauxParCulture, totauxParTypeEngrais, type EngraisTotal } from "@/lib/engraisCalc"
import { currentIsoDate, periodBounds, type Periodicity } from "@/lib/dateRange"
import { formatDate, formatNumber } from "@/lib/format"
import type { EngraisApplication } from "@/types/production"

const PERIODICITIES: Periodicity[] = ["month", "year"]
const PERIODICITY_LABEL_KEYS: Record<Periodicity, string> = {
  day: "rapports.periodicityDay",
  week: "rapports.periodicityWeek",
  month: "rapports.periodicityMonth",
  year: "rapports.periodicityYear",
}

type FormValues = { date: string; culture: string; typeEngrais: string; quantiteKg: number; parcelle: string; observation: string }

function RecapList({ title, rows, unitLabel }: { title: string; rows: EngraisTotal[]; unitLabel: string }) {
  if (rows.length === 0) return null
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="mb-3 text-sm font-semibold text-foreground">{title}</p>
      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <li key={row.cle} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-foreground">{row.cle}</span>
            <span className="text-muted-foreground">
              {formatNumber(row.quantiteKg)} {unitLabel}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function EngraisTab({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation()
  const { applications, isLoading, fetchAll, addApplication, updateApplication, deleteApplication } = useEngraisStore()
  const engraisTypes = useEngraisTypesStore()
  const cultureTypes = useCultureTypesStore((s) => s.types)
  const [entryOpen, setEntryOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<EngraisApplication | null>(null)
  const [periodicity, setPeriodicity] = useState<Periodicity>("month")

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const period = useMemo(() => periodBounds(periodicity, currentIsoDate()), [periodicity])
  const total = totalEngrais(applications, period.start, period.end)
  const parCulture = totauxParCulture(applications, period.start, period.end)
  const parType = totauxParTypeEngrais(applications, period.start, period.end)

  const schema = useMemo(
    () =>
      z.object({
        date: z.string().min(1, t("stock.movements.validationDate")),
        culture: z.string().min(1, t("production.engrais.validationCulture")),
        typeEngrais: z.string().min(1, t("production.engrais.validationType")),
        quantiteKg: z.number({ error: t("stock.inventory.validationNumber") }).positive(t("stock.movements.validationQuantity")),
        parcelle: z.string(),
        observation: z.string(),
      }),
    [t]
  )

  const fields: FieldConfig<FormValues>[] = useMemo(
    () => [
      { type: "date", name: "date", label: t("production.common.date") },
      { type: "select", name: "culture", label: t("production.engrais.fieldCulture"), options: cultureTypes.map((c) => ({ value: c.nom, label: c.nom })) },
      { type: "select", name: "typeEngrais", label: t("production.engrais.fieldType"), options: engraisTypes.types.map((e) => ({ value: e.nom, label: e.nom })) },
      { type: "number", name: "quantiteKg", label: t("production.engrais.fieldQuantity"), unit: "kg" },
      { type: "text", name: "parcelle", label: t("production.engrais.fieldPlot"), placeholder: t("production.engrais.fieldPlotPlaceholder") },
      { type: "text", name: "observation", label: t("production.common.observation"), placeholder: t("production.common.observationPlaceholder") },
    ],
    [t, cultureTypes, engraisTypes.types]
  )

  async function handleSubmit(values: FormValues) {
    if (editingEntry) {
      await updateApplication(editingEntry.id, values)
      toast.success(t("production.engrais.toastModified"))
    } else {
      await addApplication(values)
      toast.success(t("production.engrais.toastCreated"))
    }
  }

  const columns: DataTableColumn<EngraisApplication>[] = [
    { key: "date", label: t("production.common.date"), render: (a) => formatDate(a.date) },
    { key: "culture", label: t("production.engrais.fieldCulture"), render: (a) => <StatusBadge label={a.culture} tone="success" /> },
    { key: "type", label: t("production.engrais.fieldType"), render: (a) => a.typeEngrais },
    { key: "quantite", label: t("production.engrais.fieldQuantity"), render: (a) => `${formatNumber(a.quantiteKg)} kg` },
    { key: "parcelle", label: t("production.engrais.fieldPlot"), render: (a) => a.parcelle || <span className="text-muted-foreground">—</span> },
    { key: "observation", label: t("production.common.observation"), render: (a) => <span className="text-muted-foreground">{a.observation}</span> },
    ...(canEdit
      ? [{
          key: "actions",
          label: "",
          className: "text-right",
          sticky: true,
          render: (a: EngraisApplication) => (
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditingEntry(a)
                  setEntryOpen(true)
                }}
                aria-label={t("common.edit")}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  deleteApplication(a.id)
                  toast.success(t("production.engrais.toastDeleted"))
                }}
                aria-label={t("common.delete")}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        } as DataTableColumn<EngraisApplication>]
      : []),
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Sprout} label={t("production.engrais.statTotal")} value={`${formatNumber(total)} kg`} tone="primary" hint={t("production.engrais.statTotalHint")} />
        <StatCard icon={Sprout} label={t("production.engrais.statCultures")} value={formatNumber(parCulture.length)} tone="success" />
        <StatCard icon={Sprout} label={t("production.engrais.statTypes")} value={formatNumber(parType.length)} tone="info" />
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
              {t("production.engrais.manageTypes")}
            </Button>
            <Button
              onClick={() => {
                setEditingEntry(null)
                setEntryOpen(true)
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("production.engrais.newApplication")}
            </Button>
          </div>
        )}
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <RecapList title={t("production.engrais.recapByCulture")} rows={parCulture} unitLabel="kg" />
        <RecapList title={t("production.engrais.recapByType")} rows={parType} unitLabel="kg" />
      </div>

      <DataTable
        columns={columns}
        rows={applications}
        rowKey={(a) => a.id}
        isLoading={isLoading}
        emptyIcon={Sprout}
        emptyTitle={t("production.engrais.emptyTitle")}
        emptyDescription={t("production.engrais.emptyDescription")}
      />

      {canEdit && (
        <>
          <QuickAddDialog
            open={entryOpen}
            onOpenChange={setEntryOpen}
            title={editingEntry ? t("production.engrais.dialogTitleEdit") : t("production.engrais.dialogTitleNew")}
            schema={schema}
            fields={fields}
            defaultValues={
              editingEntry
                ? {
                    date: editingEntry.date,
                    culture: editingEntry.culture,
                    typeEngrais: editingEntry.typeEngrais,
                    quantiteKg: editingEntry.quantiteKg,
                    parcelle: editingEntry.parcelle,
                    observation: editingEntry.observation,
                  }
                : {
                    date: currentIsoDate(),
                    culture: cultureTypes[0]?.nom ?? "",
                    typeEngrais: engraisTypes.types[0]?.nom ?? "",
                    quantiteKg: 0,
                    parcelle: "",
                    observation: "",
                  }
            }
            onSubmit={handleSubmit}
          />
          <TypesManagerDialog
            open={manageOpen}
            onOpenChange={setManageOpen}
            title={t("production.engrais.manageTypesTitle")}
            fields={[{ name: "nom", label: t("production.engrais.fieldType"), type: "text" }]}
            items={engraisTypes.types}
            onAdd={(v) => engraisTypes.addType(v.nom as string)}
            onUpdate={(id, v) => engraisTypes.updateType(id, v.nom as string)}
            onDelete={engraisTypes.removeType}
          />
        </>
      )}
    </div>
  )
}
