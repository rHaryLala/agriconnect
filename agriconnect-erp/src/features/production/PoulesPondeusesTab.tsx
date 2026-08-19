import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus, Egg, Trash2, Pencil, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { TypesManagerDialog } from "@/components/shared/TypesManagerDialog"
import { PouleEntryDialog } from "./PouleEntryDialog"
import { useProductionStore } from "./productionStore"
import { useCagesStore } from "./cagesStore"
import { formatDate, formatNumber } from "@/lib/format"
import { hasAlertKeyword, type RowTone } from "@/lib/alerts"
import type { PouleEntry } from "@/types/production"

function totalPoules(entry: PouleEntry): number {
  return entry.cages.reduce((sum, c) => sum + c.nbPoules, 0)
}

export function PoulesPondeusesTab() {
  const { poules: entries, isLoading, fetchAll, addPoule, updatePoule, deletePoule } = useProductionStore()
  const { cages: cagesProfiles, addCage, updateCage, removeCage } = useCagesStore()
  const [entryOpen, setEntryOpen] = useState(false)
  const [cageOpen, setCageOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<PouleEntry | null>(null)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const latest = entries[0]
  const totalPoulesActuel = latest ? totalPoules(latest) : 0
  const tauxPonte = latest && totalPoulesActuel > 0 ? (latest.oeufsProduits / totalPoulesActuel) * 100 : 0
  const mortaliteCumulee = entries.reduce((sum, e) => sum + e.mortalite, 0)

  function openCreate() {
    setEditingEntry(null)
    setEntryOpen(true)
  }
  function openEdit(entry: PouleEntry) {
    setEditingEntry(entry)
    setEntryOpen(true)
  }

  async function handleSubmit(values: Omit<PouleEntry, "id">) {
    if (editingEntry) {
      await updatePoule(editingEntry.id, values)
      toast.success("Relevé modifié")
    } else {
      await addPoule(values)
      toast.success("Relevé enregistré")
    }
  }

  function rowTone(e: PouleEntry): RowTone {
    if (hasAlertKeyword(e.observation)) return "critical"
    if (e.mortalite > 0) return "warning"
    return null
  }

  const columns: DataTableColumn<PouleEntry>[] = [
    { key: "date", label: "Date", render: (e) => formatDate(e.date) },
    ...cagesProfiles.map((c): DataTableColumn<PouleEntry> => ({
      key: c.id,
      label: c.nom,
      render: (e) => formatNumber(e.cages.find((cg) => cg.cageId === c.id)?.nbPoules ?? 0),
    })),
    { key: "total", label: "Total poules", render: (e) => formatNumber(totalPoules(e)) },
    { key: "oeufs", label: "Œufs", render: (e) => formatNumber(e.oeufsProduits) },
    { key: "casses", label: "Œufs cassés", render: (e) => formatNumber(e.oeufsCasses) },
    { key: "aliments", label: "Aliments", render: (e) => `${formatNumber(e.alimentsKg)} kg` },
    { key: "mortalite", label: "Mortalité", render: (e) => formatNumber(e.mortalite) },
    { key: "observation", label: "Observation", render: (e) => <span className="text-muted-foreground">{e.observation}</span> },
    {
      key: "actions",
      label: "",
      className: "text-right",
      sticky: true,
      render: (e) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(e)} aria-label="Modifier">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { deletePoule(e.id); toast.success("Relevé supprimé") }} aria-label="Supprimer">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={Egg} label="Poules (dernier relevé)" value={formatNumber(totalPoulesActuel)} tone="primary" />
        <StatCard icon={Egg} label="Taux de ponte" value={`${tauxPonte.toFixed(1)} %`} tone="success" />
        <StatCard icon={Egg} label="Mortalité cumulée" value={formatNumber(mortaliteCumulee)} tone="warning" />
      </div>

      <div className="mb-3 flex justify-end gap-2">
        <Button variant="outline" onClick={() => setCageOpen(true)} className="gap-2">
          <Settings2 className="h-4 w-4" />
          Gérer les cages
        </Button>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Saisir un relevé
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={entries}
        rowKey={(e) => e.id}
        isLoading={isLoading}
        emptyIcon={Egg}
        emptyTitle="Aucun relevé"
        emptyDescription="Saisis le premier relevé avec le bouton ci-dessus."
        rowTone={rowTone}
      />

      <PouleEntryDialog open={entryOpen} onOpenChange={setEntryOpen} cages={cagesProfiles} editingEntry={editingEntry} onSubmit={handleSubmit} />

      <TypesManagerDialog
        open={cageOpen}
        onOpenChange={setCageOpen}
        title="Gérer les cages"
        fields={[
          { name: "nom", label: "Nom (ex: C5)", type: "text" },
          { name: "capaciteMax", label: "Capacité max", type: "number" },
        ]}
        items={cagesProfiles}
        onAdd={(v) => addCage(v.nom as string, v.capaciteMax as number)}
        onUpdate={(id, v) => updateCage(id, { nom: v.nom as string, capaciteMax: v.capaciteMax as number })}
        onDelete={removeCage}
      />
    </div>
  )
}