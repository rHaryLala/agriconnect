import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, Beef, Trash2, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { BovinEntryDialog } from "./BovinEntryDialog"
import { BovinSortieDialog } from "./BovinSortieDialog"
import { useBovinsStore } from "./bovinsStore"
import { useInvoicesStore } from "@/features/clients/invoicesStore"
import { useClientsStore } from "@/features/clients/clientsStore"
import { formatDate, formatNumber, formatCurrency } from "@/lib/format"
import {
  countEffectifActuel,
  countEffectifAt,
  countEntreesSurPeriode,
  countSortiesSurPeriode,
} from "@/lib/bovinsCalc"
import { endOfPreviousMonth, startOfMonth } from "@/lib/dateRange"
import type { BovinAnimal, BovinSortieType } from "@/types/production"

export function BovinsTab({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation()
  const { animaux, isLoading, fetchAll, addAnimal, recordSortie, deleteAnimal } = useBovinsStore()
  const { addInvoice } = useInvoicesStore()
  const { clients, fetchAll: fetchClients } = useClientsStore()
  const [entryOpen, setEntryOpen] = useState(false)
  const [sortieAnimal, setSortieAnimal] = useState<BovinAnimal | null>(null)

  useEffect(() => {
    fetchAll()
    fetchClients()
  }, [fetchAll, fetchClients])

  function clientName(id?: string): string {
    if (!id) return "—"
    return clients.find((c) => c.id === id)?.nom ?? "—"
  }

  const today = new Date().toISOString().slice(0, 10)
  const startMonth = startOfMonth(today)
  const effectifActuel = countEffectifActuel(animaux)
  const entreesMois = countEntreesSurPeriode(animaux, startMonth, today)
  const ventesMois = countSortiesSurPeriode(animaux, "vente", startMonth, today)
  const decesMois = countSortiesSurPeriode(animaux, "deces", startMonth, today)
  const effectifReporte = countEffectifAt(animaux, endOfPreviousMonth(today))

  async function handleAddAnimal(data: Omit<BovinAnimal, "id" | "statut">) {
    await addAnimal(data)
    toast.success(t("production.bovins.toastCreated"))
  }

  async function handleSortie(id: string, data: { dateSortie: string; typeSortie: BovinSortieType; clientId?: string; prixVente?: number; signataire: string; observation: string }) {
    await recordSortie(id, data)
    if (data.typeSortie === "vente" && data.clientId) {
      await addInvoice({
        clientId: data.clientId,
        date: data.dateSortie,
        paymentMethod: "commande",
        items: [{ bovinId: id, quantite: 1, prixUnitaire: data.prixVente ?? 0 }],
        montantPaye: 0,
      })
    }
    toast.success(t("production.bovins.toastSortieRecorded"))
  }

  const columns: DataTableColumn<BovinAnimal>[] = [
    { key: "identifiant", label: t("production.bovins.colIdentifiant"), render: (a) => a.identifiant },
    { key: "genre", label: t("production.bovins.fieldGenre"), render: (a) => t(`production.bovins.genre${a.genre === "male" ? "Male" : "Femelle"}`) },
    { key: "dateEntree", label: t("production.bovins.fieldDateEntree"), render: (a) => formatDate(a.dateEntree) },
    { key: "typeEntree", label: t("production.bovins.fieldTypeEntree"), render: (a) => t(`production.bovins.typeEntree${a.typeEntree === "achat" ? "Achat" : "Naissance"}`) },
    {
      key: "statut",
      label: t("production.bovins.colStatut"),
      render: (a) => (
        <StatusBadge
          label={t(`production.bovins.statut${a.statut === "present" ? "Present" : a.statut === "vendu" ? "Vendu" : "Mort"}`)}
          tone={a.statut === "present" ? "success" : a.statut === "vendu" ? "info" : "destructive"}
        />
      ),
    },
    { key: "dateSortie", label: t("production.bovins.fieldDateSortie"), render: (a) => (a.dateSortie ? formatDate(a.dateSortie) : "—") },
    { key: "client", label: t("clients.invoices.colClient"), render: (a) => (a.typeSortie === "vente" ? clientName(a.clientId) : "—") },
    { key: "prixVente", label: t("production.bovins.fieldPrixVente"), render: (a) => (a.prixVente ? formatCurrency(a.prixVente) : "—") },
    { key: "signataire", label: t("production.bovins.fieldSignataire"), render: (a) => a.signataire ?? "—" },
    { key: "observation", label: t("production.common.observation"), render: (a) => <span className="text-muted-foreground">{a.observation}</span> },
    ...(canEdit
      ? [{
          key: "actions", label: "", className: "text-right", sticky: true,
          render: (a: BovinAnimal) => (
            <div className="flex justify-end gap-1">
              {a.statut === "present" && (
                <Button variant="ghost" size="icon" onClick={() => setSortieAnimal(a)} aria-label={t("production.bovins.sortieButton")}>
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => { deleteAnimal(a.id); toast.success(t("production.bovins.toastDeleted")) }} aria-label={t("common.delete")}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        } as DataTableColumn<BovinAnimal>]
      : []),
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Beef} label={t("production.bovins.statEffectifActuel")} value={formatNumber(effectifActuel)} tone="primary" />
        <StatCard icon={Beef} label={t("production.bovins.statEntreesMois")} value={formatNumber(entreesMois)} tone="success" />
        <StatCard icon={Beef} label={t("production.bovins.statVentesMois")} value={formatNumber(ventesMois)} tone="info" />
        <StatCard icon={Beef} label={t("production.bovins.statDecesMois")} value={formatNumber(decesMois)} tone="destructive" />
        <StatCard icon={Beef} label={t("production.bovins.statEffectifReporte")} value={formatNumber(effectifReporte)} tone="warning" hint={t("production.bovins.statEffectifReporteHint")} />
      </div>

      {canEdit && (
        <div className="mb-3 flex justify-end">
          <Button onClick={() => setEntryOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("production.bovins.newAnimal")}
          </Button>
        </div>
      )}

      <DataTable columns={columns} rows={animaux} rowKey={(a) => a.id} isLoading={isLoading} emptyIcon={Beef} emptyTitle={t("production.bovins.emptyTitle")} emptyDescription={t("production.bovins.emptyDescription")} />

      {canEdit && <BovinEntryDialog open={entryOpen} onOpenChange={setEntryOpen} onSubmit={handleAddAnimal} />}

      {canEdit && (
        <BovinSortieDialog
          open={sortieAnimal !== null}
          onOpenChange={(open) => { if (!open) setSortieAnimal(null) }}
          animal={sortieAnimal}
          clients={clients}
          onSubmit={handleSortie}
        />
      )}
    </div>
  )
}
