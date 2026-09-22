import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, Beef, LogOut, Settings2 } from "lucide-react"
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { TypesManagerDialog } from "@/components/shared/TypesManagerDialog"
import { useBovinRacesStore, useBovinTypesStore } from "./bovinReferentialsStore"
import { BOVIN_ETAT_LABEL_KEYS, BOVIN_ETAT_TONES, BOVIN_PRODUCTIVITE_LABEL_KEYS, BOVIN_PRODUCTIVITE_TONES } from "./bovinLabels"
import { BOVIN_ETATS, type BovinAnimal, type BovinEtat, type BovinSortieType, type BovinStatut } from "@/types/production"
import { ConfirmDeleteButton } from "@/components/shared/ConfirmDeleteButton"

export function BovinsTab({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation()
  const { animaux, isLoading, fetchAll, addAnimal, recordSortie, deleteAnimal } = useBovinsStore()
  const { addInvoice } = useInvoicesStore()
  const { clients, fetchAll: fetchClients } = useClientsStore()
  const [entryOpen, setEntryOpen] = useState(false)
  const [sortieAnimal, setSortieAnimal] = useState<BovinAnimal | null>(null)
  const [statutFilter, setStatutFilter] = useState<BovinStatut | "tous">("tous")
  const [typeFilter, setTypeFilter] = useState<string>("tous")
  const [etatFilter, setEtatFilter] = useState<BovinEtat | "tous">("tous")
  const [manageRacesOpen, setManageRacesOpen] = useState(false)
  const [manageTypesOpen, setManageTypesOpen] = useState(false)

  const races = useBovinRacesStore()
  const bovinTypes = useBovinTypesStore()

  const filtered = useMemo(
    () =>
      animaux.filter((a) => {
        if (statutFilter !== "tous" && a.statut !== statutFilter) return false
        if (typeFilter !== "tous" && a.type !== typeFilter) return false
        if (etatFilter !== "tous" && a.etat !== etatFilter) return false
        return true
      }),
    [animaux, statutFilter, typeFilter, etatFilter]
  )

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
        items: [{ bovinId: id, libelle: "Bovin", quantite: 1, prixUnitaire: data.prixVente ?? 0 }],
        montantPaye: 0,
      })
    }
    toast.success(t("production.bovins.toastSortieRecorded"))
  }

  const columns: DataTableColumn<BovinAnimal>[] = [
    { key: "identifiant", label: t("production.bovins.colIdentifiant"), render: (a) => a.identifiant },
    { key: "genre", label: t("production.bovins.fieldGenre"), render: (a) => t(`production.bovins.genre${a.genre === "male" ? "Male" : "Femelle"}`) },
    { key: "race", label: t("production.bovins.fieldRace"), render: (a) => a.race || <span className="text-muted-foreground">—</span> },
    { key: "type", label: t("production.bovins.fieldType"), render: (a) => a.type || <span className="text-muted-foreground">—</span> },
    {
      key: "productivite",
      label: t("production.bovins.fieldProductivite"),
      render: (a) =>
        a.productivite ? (
          <StatusBadge label={t(BOVIN_PRODUCTIVITE_LABEL_KEYS[a.productivite])} tone={BOVIN_PRODUCTIVITE_TONES[a.productivite]} />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "etat",
      label: t("production.bovins.fieldEtat"),
      render: (a) =>
        a.etat ? (
          <StatusBadge label={t(BOVIN_ETAT_LABEL_KEYS[a.etat])} tone={BOVIN_ETAT_TONES[a.etat]} />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
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
              <ConfirmDeleteButton onConfirm={() => { deleteAnimal(a.id); toast.success(t("production.bovins.toastDeleted")) }} />
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

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1">
            {(["tous", "present", "vendu", "mort"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatutFilter(f)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-200 ${statutFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {f === "tous" ? t("stock.locations.all") : t(`production.bovins.statut${f === "present" ? "Present" : f === "vendu" ? "Vendu" : "Mort"}`)}
              </button>
            ))}
          </div>

          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "tous")}>
            <SelectTrigger className="w-40" aria-label={t("production.bovins.fieldType")}>
              <SelectValue placeholder="..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">{t("production.bovins.filterAllTypes")}</SelectItem>
              {bovinTypes.types.map((bt) => (
                <SelectItem key={bt.id} value={bt.nom}>
                  {bt.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={etatFilter} onValueChange={(v) => setEtatFilter((v ?? "tous") as BovinEtat | "tous")}>
            <SelectTrigger className="w-44" aria-label={t("production.bovins.fieldEtat")}>
              <SelectValue placeholder="..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">{t("production.bovins.filterAllStates")}</SelectItem>
              {BOVIN_ETATS.map((e) => (
                <SelectItem key={e} value={e}>
                  {t(BOVIN_ETAT_LABEL_KEYS[e])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {canEdit && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setManageRacesOpen(true)} className="gap-2">
              <Settings2 className="h-4 w-4" />
              {t("production.bovins.manageRaces")}
            </Button>
            <Button variant="outline" onClick={() => setManageTypesOpen(true)} className="gap-2">
              <Settings2 className="h-4 w-4" />
              {t("production.bovins.manageTypes")}
            </Button>
            <Button onClick={() => setEntryOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("production.bovins.newAnimal")}
            </Button>
          </div>
        )}
      </div>

      <DataTable columns={columns} rows={filtered} rowKey={(a) => a.id} isLoading={isLoading} emptyIcon={Beef} emptyTitle={t("production.bovins.emptyTitle")} emptyDescription={t("production.bovins.emptyDescription")} />

      {canEdit && <BovinEntryDialog open={entryOpen} onOpenChange={setEntryOpen} onSubmit={handleAddAnimal} />}

      {canEdit && (
        <>
          <TypesManagerDialog
            open={manageRacesOpen}
            onOpenChange={setManageRacesOpen}
            title={t("production.bovins.manageRacesTitle")}
            fields={[{ name: "nom", label: t("production.bovins.fieldRace"), type: "text" }]}
            items={races.types}
            onAdd={(v) => races.addType(v.nom as string)}
            onUpdate={(id, v) => races.updateType(id, v.nom as string)}
            onDelete={races.removeType}
          />
          <TypesManagerDialog
            open={manageTypesOpen}
            onOpenChange={setManageTypesOpen}
            title={t("production.bovins.manageTypesTitle")}
            fields={[{ name: "nom", label: t("production.bovins.fieldType"), type: "text" }]}
            items={bovinTypes.types}
            onAdd={(v) => bovinTypes.addType(v.nom as string)}
            onUpdate={(id, v) => bovinTypes.updateType(id, v.nom as string)}
            onDelete={bovinTypes.removeType}
          />
        </>
      )}

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
