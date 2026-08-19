import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus, Milk, Trash2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { AddTypeDialog } from "@/components/shared/AddTypeDialog"
import { VacheEntryDialog } from "./VacheEntryDialog"
import { useProductionStore } from "./productionStore"
import { useVachesStore } from "./vachesStore"
import { formatDate, formatNumber } from "@/lib/format"
import type { VacheEntry } from "@/types/production"

function totalJour(entry: VacheEntry): number {
  return entry.traites.reduce((sum, t) => sum + t.matin + t.soir, 0)
}

export function VachesLaitieresTab() {
  const { vaches: entries, isLoading, fetchAll, addVache, deleteVache } = useProductionStore()
  const vachesProfiles = useVachesStore((s) => s.vaches)
  const addVacheProfile = useVachesStore((s) => s.addVache)
  const [entryOpen, setEntryOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const litresCumules = entries.reduce((sum, e) => sum + totalJour(e), 0)
  const latest = entries[0]

  async function handleAdd(values: Omit<VacheEntry, "id">) {
    await addVache(values)
    toast.success("Relevé enregistré")
  }

  const columns: DataTableColumn<VacheEntry>[] = [
    { key: "date", label: "Date", render: (e) => formatDate(e.date) },
    ...vachesProfiles.map(
      (v): DataTableColumn<VacheEntry> => ({
        key: v.id,
        label: v.nom,
        render: (e) => {
          const t = e.traites.find((tr) => tr.vacheId === v.id)
          return t ? `${formatNumber(t.matin)} / ${formatNumber(t.soir)}` : "— / —"
        },
      })
    ),
    { key: "total", label: "Total jour (L)", render: (e) => formatNumber(totalJour(e)) },
    { key: "alimentation", label: "Alimentation", render: (e) => `${formatNumber(e.alimentationKg)} kg` },
    { key: "sanitaire", label: "Observation", render: (e) => <span className="text-muted-foreground">{e.suiviSanitaire}</span> },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (e) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => toast.info("Modification disponible à la prochaine étape")} aria-label="Modifier">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              deleteVache(e.id)
              toast.success("Relevé supprimé")
            }}
            aria-label="Supprimer"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Milk} label="Vaches suivies" value={formatNumber(vachesProfiles.length)} tone="primary" />
        <StatCard icon={Milk} label="Dernier relevé (jour)" value={latest ? `${formatNumber(totalJour(latest))} L` : "—"} tone="success" />
        <StatCard icon={Milk} label="Lait cumulé" value={`${formatNumber(litresCumules)} L`} tone="info" />
      </div>

      <div className="mb-3 flex justify-end gap-2">
        <Button variant="outline" onClick={() => setProfileOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une vache
        </Button>
        <Button onClick={() => setEntryOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Saisir un relevé
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={entries}
        rowKey={(e) => e.id}
        isLoading={isLoading}
        emptyIcon={Milk}
        emptyTitle="Aucun relevé"
        emptyDescription="Saisis le premier relevé avec le bouton ci-dessus."
      />

      <VacheEntryDialog open={entryOpen} onOpenChange={setEntryOpen} vaches={vachesProfiles} onSubmit={handleAdd} />

      <AddTypeDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        title="Ajouter une vache"
        fieldLabel="Nom de la vache"
        placeholder="Ex: Vero"
        onSubmit={addVacheProfile}
      />
    </div>
  )
}