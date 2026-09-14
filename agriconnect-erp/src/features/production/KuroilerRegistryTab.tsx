import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { Bird, Plus, Pencil, Trash2, LogOut, Scale, Egg } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { QuickAddDialog, type FieldConfig } from "@/components/shared/QuickAddDialog"
import { KuroilerPouleDialog } from "./KuroilerPouleDialog"
import { useKuroilerPoulesStore } from "./kuroilerPoulesStore"
import { countPoulesActives, countPoulesByStatut, computePoidsMoyen, computeTauxPonte, latestSuivi } from "@/lib/kuroilerCalc"
import { formatDate, formatNumber } from "@/lib/format"
import { KUROILER_POULE_STATUTS, type KuroilerPoule, type KuroilerPouleStatut } from "@/types/production"

const STATUT_LABEL_KEYS: Record<KuroilerPouleStatut, string> = {
  active: "production.kuroiler.registry.statutActive",
  vendue: "production.kuroiler.registry.statutSold",
  morte: "production.kuroiler.registry.statutDead",
  perdue: "production.kuroiler.registry.statutLost",
}

const STATUT_TONES: Record<KuroilerPouleStatut, "success" | "info" | "destructive" | "warning"> = {
  active: "success",
  vendue: "info",
  morte: "destructive",
  perdue: "warning",
}

type SuiviValues = { date: string; poidsKg: number; vaccin: string; observation: string }
type SortieValues = { statut: string; dateSortie: string; observation: string }

export function KuroilerRegistryTab({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation()
  const { poules, suivis, isLoading, fetchAll, addPoule, updatePoule, recordSortie, deletePoule, addSuivi } = useKuroilerPoulesStore()
  const [pouleOpen, setPouleOpen] = useState(false)
  const [editingPoule, setEditingPoule] = useState<KuroilerPoule | null>(null)
  const [suiviPoule, setSuiviPoule] = useState<KuroilerPoule | null>(null)
  const [sortiePoule, setSortiePoule] = useState<KuroilerPoule | null>(null)
  const [statutFilter, setStatutFilter] = useState<KuroilerPouleStatut | "tous">("tous")

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const filtered = useMemo(
    () => (statutFilter === "tous" ? poules : poules.filter((p) => p.statut === statutFilter)),
    [poules, statutFilter]
  )

  const effectif = countPoulesActives(poules)
  const tauxPonte = computeTauxPonte(poules)
  const poidsMoyen = computePoidsMoyen(poules, suivis)
  const mortalite = countPoulesByStatut(poules, "morte")

  const suiviSchema = useMemo(
    () =>
      z.object({
        date: z.string().min(1, t("stock.movements.validationDate")),
        poidsKg: z.number({ error: t("stock.inventory.validationNumber") }).positive(t("stock.inventory.validationNumber")),
        vaccin: z.string(),
        observation: z.string(),
      }),
    [t]
  )
  const suiviFields: FieldConfig<SuiviValues>[] = useMemo(
    () => [
      { type: "date", name: "date", label: t("production.common.date") },
      { type: "number", name: "poidsKg", label: t("production.kuroiler.registry.fieldWeight"), unit: "kg", step: "0.1" },
      { type: "text", name: "vaccin", label: t("production.kuroiler.registry.fieldVaccine"), placeholder: t("production.kuroiler.registry.fieldVaccinePlaceholder") },
      { type: "text", name: "observation", label: t("production.common.observation"), placeholder: t("production.common.observationPlaceholder") },
    ],
    [t]
  )

  const sortieSchema = useMemo(
    () =>
      z.object({
        statut: z.string().min(1, t("production.kuroiler.registry.validationOutcome")),
        dateSortie: z.string().min(1, t("stock.movements.validationDate")),
        observation: z.string(),
      }),
    [t]
  )
  const sortieFields: FieldConfig<SortieValues>[] = useMemo(
    () => [
      {
        type: "select",
        name: "statut",
        label: t("production.kuroiler.registry.fieldOutcome"),
        options: KUROILER_POULE_STATUTS.filter((s) => s !== "active").map((s) => ({ value: s, label: t(STATUT_LABEL_KEYS[s]) })),
      },
      { type: "date", name: "dateSortie", label: t("production.kuroiler.registry.fieldDateSortie") },
      { type: "text", name: "observation", label: t("production.common.observation"), placeholder: t("production.common.observationPlaceholder") },
    ],
    [t]
  )

  function openCreate() {
    setEditingPoule(null)
    setPouleOpen(true)
  }

  async function handleSubmitPoule(values: Omit<KuroilerPoule, "id" | "statut">) {
    if (editingPoule) {
      await updatePoule(editingPoule.id, values)
      toast.success(t("production.kuroiler.registry.toastModified"))
    } else {
      await addPoule(values)
      toast.success(t("production.kuroiler.registry.toastCreated"))
    }
  }

  async function handleSuivi(values: SuiviValues) {
    if (!suiviPoule) return
    await addSuivi({ ...values, pouleId: suiviPoule.id })
    toast.success(t("production.kuroiler.registry.toastSuiviCreated"))
    setSuiviPoule(null)
  }

  async function handleSortie(values: SortieValues) {
    if (!sortiePoule) return
    await recordSortie(sortiePoule.id, {
      statut: values.statut as Exclude<KuroilerPouleStatut, "active">,
      dateSortie: values.dateSortie,
      observation: values.observation,
    })
    toast.success(t("production.kuroiler.registry.toastSortieRecorded"))
    setSortiePoule(null)
  }

  const columns: DataTableColumn<KuroilerPoule>[] = [
    { key: "bracelet", label: t("production.kuroiler.registry.fieldBracelet"), render: (p) => p.bracelet },
    { key: "dateEntree", label: t("production.kuroiler.registry.fieldDateEntree"), render: (p) => formatDate(p.dateEntree) },
    { key: "age", label: t("production.kuroiler.registry.fieldAge"), render: (p) => t("production.kuroiler.registry.ageMonths", { count: p.ageMois }) },
    {
      key: "poids",
      label: t("production.kuroiler.registry.colLastWeight"),
      render: (p) => {
        const last = latestSuivi(suivis, p.id)
        return last ? `${formatNumber(last.poidsKg)} kg` : <span className="text-muted-foreground">—</span>
      },
    },
    {
      key: "vaccin",
      label: t("production.kuroiler.registry.colLastVaccine"),
      render: (p) => latestSuivi(suivis, p.id)?.vaccin || <span className="text-muted-foreground">—</span>,
    },
    {
      key: "ponte",
      label: t("production.kuroiler.registry.fieldLaying"),
      render: (p) => <StatusBadge label={p.ponte ? t("common.yes") : t("common.no")} tone={p.ponte ? "success" : "muted"} />,
    },
    {
      key: "statut",
      label: t("production.bovins.colStatut"),
      render: (p) => <StatusBadge label={t(STATUT_LABEL_KEYS[p.statut])} tone={STATUT_TONES[p.statut]} />,
    },
    { key: "observation", label: t("production.common.observation"), render: (p) => <span className="text-muted-foreground">{p.observation}</span> },
    ...(canEdit
      ? [{
          key: "actions",
          label: "",
          className: "text-right",
          sticky: true,
          render: (p: KuroilerPoule) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" onClick={() => setSuiviPoule(p)} aria-label={t("production.kuroiler.registry.recordFollowUp")}>
                <Scale className="h-4 w-4" />
              </Button>
              {p.statut === "active" && (
                <Button variant="ghost" size="icon" onClick={() => setSortiePoule(p)} aria-label={t("production.kuroiler.registry.recordOutcome")}>
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditingPoule(p)
                  setPouleOpen(true)
                }}
                aria-label={t("common.edit")}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  deletePoule(p.id)
                  toast.success(t("production.kuroiler.registry.toastDeleted"))
                }}
                aria-label={t("common.delete")}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        } as DataTableColumn<KuroilerPoule>]
      : []),
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Bird} label={t("production.kuroiler.registry.statFlock")} value={formatNumber(effectif)} tone="primary" />
        <StatCard icon={Egg} label={t("production.kuroiler.registry.statLayingRate")} value={`${tauxPonte.toFixed(0)} %`} tone="success" />
        <StatCard icon={Scale} label={t("production.kuroiler.registry.statAverageWeight")} value={`${poidsMoyen.toFixed(1)} kg`} tone="info" />
        <StatCard icon={Bird} label={t("production.kuroiler.registry.statMortality")} value={formatNumber(mortalite)} tone={mortalite > 0 ? "destructive" : "success"} />
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1">
          {(["tous", ...KUROILER_POULE_STATUTS] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatutFilter(f)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-200 ${statutFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f === "tous" ? t("stock.locations.all") : t(STATUT_LABEL_KEYS[f])}
            </button>
          ))}
        </div>

        {canEdit && (
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("production.kuroiler.registry.newHen")}
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        emptyIcon={Bird}
        emptyTitle={t("production.kuroiler.registry.emptyTitle")}
        emptyDescription={t("production.kuroiler.registry.emptyDescription")}
      />

      {canEdit && (
        <>
          <KuroilerPouleDialog open={pouleOpen} onOpenChange={setPouleOpen} editingPoule={editingPoule} onSubmit={handleSubmitPoule} />
          <QuickAddDialog
            open={!!suiviPoule}
            onOpenChange={(open) => !open && setSuiviPoule(null)}
            title={t("production.kuroiler.registry.suiviDialogTitle", { bracelet: suiviPoule?.bracelet ?? "" })}
            schema={suiviSchema}
            fields={suiviFields}
            defaultValues={{ date: new Date().toISOString().slice(0, 10), poidsKg: 0, vaccin: "", observation: "" }}
            onSubmit={handleSuivi}
          />
          <QuickAddDialog
            open={!!sortiePoule}
            onOpenChange={(open) => !open && setSortiePoule(null)}
            title={t("production.kuroiler.registry.sortieDialogTitle", { bracelet: sortiePoule?.bracelet ?? "" })}
            schema={sortieSchema}
            fields={sortieFields}
            defaultValues={{ statut: "vendue", dateSortie: new Date().toISOString().slice(0, 10), observation: "" }}
            onSubmit={handleSortie}
          />
        </>
      )}
    </div>
  )
}
