import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Wheat, Trash2, Pencil, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { TypesManagerDialog } from "@/components/shared/TypesManagerDialog"
import { AgricultureEntryDialog } from "./AgricultureEntryDialog"
import { useProductionStore } from "./productionStore"
import { useCultureTypesStore } from "./cultureTypesStore"
import { formatDate, formatNumber, formatCurrency } from "@/lib/format"
import type { CultureEntry } from "@/types/production"

export function AgricultureTab() {
  const { cultures, isLoading, fetchAll, addCulture, deleteCulture } = useProductionStore()
  const cultureTypes = useCultureTypesStore((s) => s.types)
  const addCultureType = useCultureTypesStore((s) => s.addType)
  const updateCultureType = useCultureTypesStore((s) => s.updateType)
  const removeCultureType = useCultureTypesStore((s) => s.removeType)
  const [entryOpen, setEntryOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const surfaceTotale = cultures.reduce((sum, e) => sum + e.surfaceHa, 0)
  const recolteTotale = cultures.reduce((sum, e) => sum + e.recolteQty, 0)
  const coutTotal = cultures.reduce((sum, e) => sum + e.coutIntrants, 0)

  async function handleAdd(values: Omit<CultureEntry, "id">) {
    await addCulture(values)
    toast.success("Entrée enregistrée")
  }

  const columns: DataTableColumn<CultureEntry>[] = [
    { key: "date", label: "Date", render: (e) => formatDate(e.date) },
    { key: "culture", label: "Culture", render: (e) => <StatusBadge label={e.culture} tone="success" /> },
    { key: "surface", label: "Surface (ha)", render: (e) => formatNumber(e.surfaceHa) },
    { key: "recolte", label: "Récolte (kg)", render: (e) => formatNumber(e.recolteQty) },
    { key: "rendement", label: "Rendement", render: (e) => (e.surfaceHa > 0 ? `${(e.recolteQty / e.surfaceHa).toFixed(0)} kg/ha` : "—") },
    { key: "cout", label: "Coût intrants", render: (e) => formatCurrency(e.coutIntrants) },
    { key: "intrants", label: "Intrants", render: (e) => <span className="text-muted-foreground">{e.intrants}</span> },
    {
      key: "actions",
      label: "",
      className: "text-right",
      sticky: true,
      render: (e) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => toast.info("Modification disponible à la prochaine étape")} aria-label="Modifier">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              deleteCulture(e.id)
              toast.success("Entrée supprimée")
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
        <StatCard icon={Wheat} label="Surface cultivée" value={`${formatNumber(surfaceTotale)} ha`} tone="primary" />
        <StatCard icon={Wheat} label="Récolte cumulée" value={`${formatNumber(recolteTotale)} kg`} tone="success" />
        <StatCard icon={Wheat} label="Coût intrants cumulé" value={formatCurrency(coutTotal)} tone="warning" />
      </div>

      <div className="mb-3 flex justify-end gap-2">
        <Button variant="outline" onClick={() => setManageOpen(true)} className="gap-2">
          <Settings2 className="h-4 w-4" />
          Gérer les cultures
        </Button>
        <Button onClick={() => setEntryOpen(true)} className="gap-2">
          <Wheat className="h-4 w-4" />
          Saisir une entrée
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={cultures}
        rowKey={(e) => e.id}
        isLoading={isLoading}
        emptyIcon={Wheat}
        emptyTitle="Aucune entrée"
        emptyDescription="Saisis la première entrée avec le bouton ci-dessus."
      />

      <AgricultureEntryDialog open={entryOpen} onOpenChange={setEntryOpen} cultures={cultureTypes} onSubmit={handleAdd} />

      <TypesManagerDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        title="Gérer les types de culture"
        fields={[{ name: "nom", label: "Nom de la culture", type: "text" }]}
        items={cultureTypes}
        onAdd={(v) => addCultureType(v.nom as string)}
        onUpdate={(id, v) => updateCultureType(id, v.nom as string)}
        onDelete={removeCultureType}
      />
    </div>
  )
}