import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { Plus, Users, Pencil, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { QuickAddDialog, type FieldConfig } from "@/components/shared/QuickAddDialog"
import { TypesManagerDialog } from "@/components/shared/TypesManagerDialog"
import { useMainOeuvreStore } from "./mainOeuvreStore"
import { useActivitesStore } from "./activitesStore"
import { moyenneEmployesParJour, totalJoursHomme, totauxParActivite } from "@/lib/mainOeuvreCalc"
import { currentIsoDate, periodBounds, type Periodicity } from "@/lib/dateRange"
import { formatDate, formatNumber } from "@/lib/format"
import type { MainOeuvreEntry } from "@/types/production"
import { ConfirmDeleteButton } from "@/components/shared/ConfirmDeleteButton"

const PERIODICITIES: Periodicity[] = ["week", "month", "year"]
const PERIODICITY_LABEL_KEYS: Record<Periodicity, string> = {
  day: "rapports.periodicityDay",
  week: "rapports.periodicityWeek",
  month: "rapports.periodicityMonth",
  year: "rapports.periodicityYear",
}

type FormValues = { date: string; activite: string; nbEmployes: number; observation: string }

export function MainOeuvreTab({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation()
  const { entries, isLoading, fetchAll, addEntry, updateEntry, deleteEntry } = useMainOeuvreStore()
  const activites = useActivitesStore()
  const [entryOpen, setEntryOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<MainOeuvreEntry | null>(null)
  const [periodicity, setPeriodicity] = useState<Periodicity>("month")

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const period = useMemo(() => periodBounds(periodicity, currentIsoDate()), [periodicity])
  const joursHomme = totalJoursHomme(entries, period.start, period.end)
  const moyenne = moyenneEmployesParJour(entries, period.start, period.end)
  const parActivite = totauxParActivite(entries, period.start, period.end)

  const schema = useMemo(
    () =>
      z.object({
        date: z.string().min(1, t("stock.movements.validationDate")),
        activite: z.string().min(1, t("production.mainOeuvre.validationActivity")),
        nbEmployes: z.number({ error: t("stock.inventory.validationNumber") }).positive(t("production.mainOeuvre.validationHeadcount")),
        observation: z.string(),
      }),
    [t]
  )

  const fields: FieldConfig<FormValues>[] = useMemo(
    () => [
      { type: "date", name: "date", label: t("production.common.date") },
      { type: "select", name: "activite", label: t("production.mainOeuvre.fieldActivity"), options: activites.types.map((a) => ({ value: a.nom, label: a.nom })) },
      { type: "number", name: "nbEmployes", label: t("production.mainOeuvre.fieldHeadcount") },
      { type: "text", name: "observation", label: t("production.common.observation"), placeholder: t("production.common.observationPlaceholder") },
    ],
    [t, activites.types]
  )

  function openCreate() {
    setEditingEntry(null)
    setEntryOpen(true)
  }

  async function handleSubmit(values: FormValues) {
    if (editingEntry) {
      await updateEntry(editingEntry.id, values)
      toast.success(t("production.mainOeuvre.toastModified"))
    } else {
      await addEntry(values)
      toast.success(t("production.mainOeuvre.toastCreated"))
    }
  }

  const columns: DataTableColumn<MainOeuvreEntry>[] = [
    { key: "date", label: t("production.common.date"), render: (e) => formatDate(e.date) },
    { key: "activite", label: t("production.mainOeuvre.fieldActivity"), render: (e) => <StatusBadge label={e.activite} tone="success" /> },
    { key: "nbEmployes", label: t("production.mainOeuvre.fieldHeadcount"), render: (e) => formatNumber(e.nbEmployes) },
    { key: "observation", label: t("production.common.observation"), render: (e) => <span className="text-muted-foreground">{e.observation}</span> },
    ...(canEdit
      ? [{
          key: "actions",
          label: "",
          className: "text-right",
          sticky: true,
          render: (e: MainOeuvreEntry) => (
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditingEntry(e)
                  setEntryOpen(true)
                }}
                aria-label={t("common.edit")}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <ConfirmDeleteButton
                onConfirm={() => {
                  deleteEntry(e.id)
                  toast.success(t("production.mainOeuvre.toastDeleted"))
                }}
              />
            </div>
          ),
        } as DataTableColumn<MainOeuvreEntry>]
      : []),
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Users} label={t("production.mainOeuvre.statManDays")} value={formatNumber(joursHomme)} tone="primary" hint={t("production.mainOeuvre.statManDaysHint")} />
        <StatCard icon={Users} label={t("production.mainOeuvre.statAverage")} value={moyenne.toFixed(1)} tone="info" />
        <StatCard icon={Users} label={t("production.mainOeuvre.statActivities")} value={formatNumber(parActivite.length)} tone="success" />
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
              {t("production.mainOeuvre.manageActivities")}
            </Button>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("production.mainOeuvre.newEntry")}
            </Button>
          </div>
        )}
      </div>

      {parActivite.length > 0 && (
        <div className="mb-4 rounded-xl border border-border bg-surface p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">{t("production.mainOeuvre.breakdownTitle")}</p>
          <ul className="flex flex-col gap-2">
            {parActivite.map((row) => (
              <li key={row.activite} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-foreground">{row.activite}</span>
                <span className="text-muted-foreground">
                  {t("production.mainOeuvre.breakdownLine", { manDays: formatNumber(row.joursHomme), days: formatNumber(row.jours) })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={entries}
        rowKey={(e) => e.id}
        isLoading={isLoading}
        emptyIcon={Users}
        emptyTitle={t("production.mainOeuvre.emptyTitle")}
        emptyDescription={t("production.mainOeuvre.emptyDescription")}
      />

      {canEdit && (
        <>
          <QuickAddDialog
            open={entryOpen}
            onOpenChange={setEntryOpen}
            title={editingEntry ? t("production.mainOeuvre.dialogTitleEdit") : t("production.mainOeuvre.dialogTitleNew")}
            schema={schema}
            fields={fields}
            defaultValues={
              editingEntry
                ? { date: editingEntry.date, activite: editingEntry.activite, nbEmployes: editingEntry.nbEmployes, observation: editingEntry.observation }
                : { date: currentIsoDate(), activite: activites.types[0]?.nom ?? "", nbEmployes: 0, observation: "" }
            }
            onSubmit={handleSubmit}
          />
          <TypesManagerDialog
            open={manageOpen}
            onOpenChange={setManageOpen}
            title={t("production.mainOeuvre.manageActivitiesTitle")}
            fields={[{ name: "nom", label: t("production.mainOeuvre.fieldActivity"), type: "text" }]}
            items={activites.types}
            onAdd={(v) => activites.addType(v.nom as string)}
            onUpdate={(id, v) => activites.updateType(id, v.nom as string)}
            onDelete={activites.removeType}
          />
        </>
      )}
    </div>
  )
}
