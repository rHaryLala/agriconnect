import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, Milk, Pencil, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { TypesManagerDialog } from "@/components/shared/TypesManagerDialog"
import { VacheEntryDialog } from "./VacheEntryDialog"
import { useProductionStore } from "./productionStore"
import { useVachesStore } from "./vachesStore"
import { formatDate, formatNumber } from "@/lib/format"
import { totalJour, totalMatin, totalSoir, totalTroupeau, totalsForVache } from "@/lib/vachesCalc"
import { hasAlertKeyword, type RowTone } from "@/lib/alerts"
import type { VacheEntry } from "@/types/production"
import { ConfirmDeleteButton } from "@/components/shared/ConfirmDeleteButton"

type MilkView = "troupeau" | "vache"

export function VachesLaitieresTab({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation()
  const { vaches: entries, isLoading, fetchAll, addVache, updateVache, deleteVache } = useProductionStore()
  const { vaches: vachesProfiles, addVache: addVacheProfile, updateVache: updateVacheProfile, removeVache: removeVacheProfile } = useVachesStore()
  const [entryOpen, setEntryOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<VacheEntry | null>(null)
  const [view, setView] = useState<MilkView>("troupeau")

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const litresCumules = totalTroupeau(entries)
  const latest = entries[0]

  function openCreate() {
    setEditingEntry(null)
    setEntryOpen(true)
  }
  function openEdit(entry: VacheEntry) {
    setEditingEntry(entry)
    setEntryOpen(true)
  }

  async function handleSubmit(values: Omit<VacheEntry, "id">) {
    if (editingEntry) {
      await updateVache(editingEntry.id, values)
      toast.success(t("production.vaches.toastModified"))
    } else {
      await addVache(values)
      toast.success(t("production.vaches.toastCreated"))
    }
  }

  function rowTone(e: VacheEntry): RowTone {
    return hasAlertKeyword(e.suiviSanitaire) ? "critical" : null
  }

  const perCowColumns: DataTableColumn<VacheEntry>[] = vachesProfiles.map((v) => ({
    key: v.id,
    label: v.nom,
    render: (e) => {
      const traite = e.traites.find((tr) => tr.vacheId === v.id)
      return traite ? `${formatNumber(traite.matin)} / ${formatNumber(traite.soir)}` : "— / —"
    },
  }))

  const herdColumns: DataTableColumn<VacheEntry>[] = [
    { key: "matin", label: t("production.vaches.colMorning"), render: (e) => formatNumber(totalMatin(e)) },
    { key: "soir", label: t("production.vaches.colEvening"), render: (e) => formatNumber(totalSoir(e)) },
  ]

  const columns: DataTableColumn<VacheEntry>[] = [
    { key: "date", label: t("production.vaches.colDate"), render: (e) => formatDate(e.date) },
    ...(view === "vache" ? perCowColumns : herdColumns),
    { key: "total", label: t("production.vaches.colTotal"), render: (e) => formatNumber(totalJour(e)) },
    { key: "alimentation", label: t("production.vaches.colFeed"), render: (e) => `${formatNumber(e.alimentationKg)} kg` },
    { key: "sanitaire", label: t("production.vaches.colObservation"), render: (e) => <span className="text-muted-foreground">{e.suiviSanitaire}</span> },
    ...(canEdit
      ? [{
          key: "actions", label: "", className: "text-right", sticky: true,
          render: (e: VacheEntry) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(e)} aria-label={t("common.edit")}>
                <Pencil className="h-4 w-4" />
              </Button>
              <ConfirmDeleteButton onConfirm={() => { deleteVache(e.id); toast.success(t("production.vaches.toastDeleted")) }} />
            </div>
          ),
        } as DataTableColumn<VacheEntry>]
      : []),
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Milk} label={t("production.vaches.statCowsCount")} value={formatNumber(vachesProfiles.length)} tone="primary" />
        <StatCard icon={Milk} label={t("production.vaches.statLastMilk")} value={latest ? `${formatNumber(totalJour(latest))} L` : "—"} tone="success" />
        <StatCard icon={Milk} label={t("production.vaches.statTotalMilk")} value={`${formatNumber(litresCumules)} L`} tone="info" />
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          {(["troupeau", "vache"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-200 ${view === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {mode === "troupeau" ? t("production.vaches.viewHerd") : t("production.vaches.viewPerCow")}
            </button>
          ))}
        </div>

        {canEdit && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setProfileOpen(true)} className="gap-2">
              <Settings2 className="h-4 w-4" />
              {t("production.vaches.manageCowsButton")}
            </Button>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("production.common.newEntry")}
            </Button>
          </div>
        )}
      </div>

      {view === "vache" && vachesProfiles.length > 0 && (
        <div className="mb-4 rounded-xl border border-border bg-surface p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">{t("production.vaches.perCowTotalsTitle")}</p>
          <ul className="flex flex-wrap gap-2">
            {vachesProfiles.map((v) => {
              const totals = totalsForVache(entries, v.id)
              return (
                <li key={v.id} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{v.nom}</span> {formatNumber(totals.total)} L
                  <span className="ml-1 opacity-70">({formatNumber(totals.matin)} / {formatNumber(totals.soir)})</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <DataTable columns={columns} rows={entries} rowKey={(e) => e.id} isLoading={isLoading} emptyIcon={Milk} emptyTitle={t("production.vaches.emptyTitle")} emptyDescription={t("production.vaches.emptyDescription")} rowTone={rowTone} />

      <VacheEntryDialog open={entryOpen} onOpenChange={setEntryOpen} vaches={vachesProfiles} editingEntry={editingEntry} onSubmit={handleSubmit} />

      <TypesManagerDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        title={t("production.vaches.manageCowsTitle")}
        fields={[{ name: "nom", label: t("production.vaches.cowNameLabel"), type: "text" }]}
        items={vachesProfiles}
        onAdd={(v) => addVacheProfile(v.nom as string)}
        onUpdate={(id, v) => updateVacheProfile(id, v.nom as string)}
        onDelete={removeVacheProfile}
      />
    </div>
  )
}