import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, Milk, Trash2, Pencil, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { TypesManagerDialog } from "@/components/shared/TypesManagerDialog"
import { VacheEntryDialog } from "./VacheEntryDialog"
import { useProductionStore } from "./productionStore"
import { useVachesStore } from "./vachesStore"
import { formatDate, formatNumber } from "@/lib/format"
import { hasAlertKeyword, type RowTone } from "@/lib/alerts"
import type { VacheEntry } from "@/types/production"

function totalJour(entry: VacheEntry): number {
  return entry.traites.reduce((sum, t) => sum + t.matin + t.soir, 0)
}

export function VachesLaitieresTab() {
  const { t } = useTranslation()
  const { vaches: entries, isLoading, fetchAll, addVache, updateVache, deleteVache } = useProductionStore()
  const { vaches: vachesProfiles, addVache: addVacheProfile, updateVache: updateVacheProfile, removeVache: removeVacheProfile } = useVachesStore()
  const [entryOpen, setEntryOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<VacheEntry | null>(null)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const litresCumules = entries.reduce((sum, e) => sum + totalJour(e), 0)
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

  const columns: DataTableColumn<VacheEntry>[] = [
    { key: "date", label: t("production.vaches.colDate"), render: (e) => formatDate(e.date) },
    ...vachesProfiles.map((v): DataTableColumn<VacheEntry> => ({
      key: v.id, label: v.nom,
      render: (e) => {
        const t = e.traites.find((tr) => tr.vacheId === v.id)
        return t ? `${formatNumber(t.matin)} / ${formatNumber(t.soir)}` : "— / —"
      },
    })),
    { key: "total", label: t("production.vaches.colTotal"), render: (e) => formatNumber(totalJour(e)) },
    { key: "alimentation", label: t("production.vaches.colFeed"), render: (e) => `${formatNumber(e.alimentationKg)} kg` },
    { key: "sanitaire", label: t("production.vaches.colObservation"), render: (e) => <span className="text-muted-foreground">{e.suiviSanitaire}</span> },
    {
      key: "actions", label: "", className: "text-right", sticky: true,
      render: (e) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(e)} aria-label={t("common.edit")}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { deleteVache(e.id); toast.success(t("production.vaches.toastDeleted")) }} aria-label={t("common.delete")}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Milk} label={t("production.vaches.statCowsCount")} value={formatNumber(vachesProfiles.length)} tone="primary" />
        <StatCard icon={Milk} label={t("production.vaches.statLastMilk")} value={latest ? `${formatNumber(totalJour(latest))} L` : "—"} tone="success" />
        <StatCard icon={Milk} label={t("production.vaches.statTotalMilk")} value={`${formatNumber(litresCumules)} L`} tone="info" />
      </div>

      <div className="mb-3 flex justify-end gap-2">
        <Button variant="outline" onClick={() => setProfileOpen(true)} className="gap-2">
          <Settings2 className="h-4 w-4" />
          {t("production.vaches.manageCowsButton")}
        </Button>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("production.common.newEntry")}
        </Button>
      </div>

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