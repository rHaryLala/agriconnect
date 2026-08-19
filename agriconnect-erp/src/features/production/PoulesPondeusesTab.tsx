import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus, Egg, Trash2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { AddCageDialog } from "@/components/shared/AddCageDialog"
import { PouleEntryDialog } from "./PouleEntryDialog"
import { useProductionStore } from "./productionStore"
import { useCagesStore } from "./cagesStore"
import { formatDate, formatNumber } from "@/lib/format"
import type { PouleEntry } from "@/types/production"

function totalPoules(entry: PouleEntry): number {
  return entry.cages.reduce((sum, c) => sum + c.nbPoules, 0)
}

export function PoulesPondeusesTab() {
  const { poules: entries, isLoading, fetchAll, addPoule, deletePoule } = useProductionStore()
  const cagesProfiles = useCagesStore((s) => s.cages)
  const addCageProfile = useCagesStore((s) => s.addCage)
  const [entryOpen, setEntryOpen] = useState(false)
  const [cageOpen, setCageOpen] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const latest = entries[0]
  const totalPoulesActuel = latest ? totalPoules(latest) : 0
  const tauxPonte = latest && totalPoulesActuel > 0 ? (latest.oeufsProduits / totalPoulesActuel) * 100 : 0
  const mortaliteCumulee = entries.reduce((sum, e) => sum + e.mortalite, 0)

  async function handleAdd(values: Omit<PouleEntry, "id">) {
    await addPoule(values)
    toast.success("Relevé enregistré")
  }

  const columns: DataTableColumn<PouleEntry>[] = [
    { key: "date", label: "Date", render: (e) => formatDate(e.date) },
    ...cagesProfiles.map(
      (c): DataTableColumn<PouleEntry> => ({
        key: c.id,
        label: c.nom,
        render: (e) => formatNumber(e.cages.find((cg) => cg.cageId === c.id)?.nbPoules ?? 0),
      })
    ),
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
      render: (e) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => toast.info("Modification disponible à la prochaine étape")} aria-label="Modifier">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              deletePoule(e.id)
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
        <StatCard icon={Egg} label="Poules (dernier relevé)" value={formatNumber(totalPoulesActuel)} tone="primary" />
        <StatCard icon={Egg} label="Taux de ponte" value={`${tauxPonte.toFixed(1)} %`} tone="success" />
        <StatCard icon={Egg} label="Mortalité cumulée" value={formatNumber(mortaliteCumulee)} tone="warning" />
      </div>

      <div className="mb-3 flex justify-end gap-2">
        <Button variant="outline" onClick={() => setCageOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une cage
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
        emptyIcon={Egg}
        emptyTitle="Aucun relevé"
        emptyDescription="Saisis le premier relevé avec le bouton ci-dessus."
      />

      <PouleEntryDialog open={entryOpen} onOpenChange={setEntryOpen} cages={cagesProfiles} onSubmit={handleAdd} />

      <AddCageDialog open={cageOpen} onOpenChange={setCageOpen} onSubmit={addCageProfile} />
    </div>
  )
}