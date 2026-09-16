import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, Truck, Wallet, Clock, Layers, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Rating } from "@/components/shared/Rating"
import { ListToolbar, type ToolbarFilter } from "@/components/shared/ListToolbar"
import { EmptyState } from "@/components/shared/EmptyState"
import { ReadOnlyBanner } from "@/components/shared/ReadOnlyBanner"
import type { ViewMode } from "@/components/shared/ViewToggle"
import { usePermission } from "@/hooks/usePermission"
import { formatCurrency, formatDate } from "@/lib/format"
import {
  countActifs, countCategories, matchesQuery, summarise,
  summariseByFournisseur, sumEnAttente, sumMontant, withinYear,
} from "@/lib/fournisseurCalc"
import { FournisseurCard } from "./FournisseurCard"
import { FournisseurFormDialog } from "./FournisseurFormDialog"
import { useFournisseursStore } from "./fournisseursStore"
import { CATEGORIE_ICONS, CATEGORIE_LABEL_KEYS, CATEGORIE_TONES } from "./fournisseurLabels"
import { FOURNISSEUR_CATEGORIES, type Fournisseur } from "@/types/fournisseur"

const ALL = "tous"
const EMPTY_SUMMARY = summarise([])

export default function FournisseursPage() {
  const { t } = useTranslation()
  const { canEdit } = usePermission("finance")
  const { fournisseurs, achats, isLoading, fetchAll, addFournisseur, updateFournisseur, deleteFournisseur } =
    useFournisseursStore()

  const [search, setSearch] = useState("")
  const [categorie, setCategorie] = useState(ALL)
  const [statut, setStatut] = useState(ALL)
  const [view, setView] = useState<ViewMode>("list")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Fournisseur | null>(null)
  const [deleting, setDeleting] = useState<Fournisseur | null>(null)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const summaries = useMemo(() => summariseByFournisseur(achats), [achats])
  const summaryOf = (id: string) => summaries.get(id) ?? EMPTY_SUMMARY

  const filtered = useMemo(
    () =>
      fournisseurs.filter(
        (fournisseur) =>
          matchesQuery(fournisseur, search) &&
          (categorie === ALL || fournisseur.categorie === categorie) &&
          (statut === ALL || fournisseur.statut === statut),
      ),
    [fournisseurs, search, categorie, statut],
  )

  const year = new Date().getFullYear()
  const achatsYtd = useMemo(() => withinYear(achats, year), [achats, year])
  const enAttenteCount = achats.filter((achat) => achat.montantPaye < achat.montant).length

  const filters: ToolbarFilter[] = [
    {
      id: "categorie",
      label: t("fournisseurs.filterCategory"),
      value: categorie,
      onChange: setCategorie,
      options: [
        { value: ALL, label: t("common.filterAll") },
        ...FOURNISSEUR_CATEGORIES.map((value) => ({ value, label: t(CATEGORIE_LABEL_KEYS[value]) })),
      ],
    },
    {
      id: "statut",
      label: t("fournisseurs.filterStatus"),
      value: statut,
      onChange: setStatut,
      options: [
        { value: ALL, label: t("common.filterAll") },
        { value: "actif", label: t("fournisseurs.statusActive") },
        { value: "inactif", label: t("fournisseurs.statusInactive") },
      ],
    },
  ]

  async function handleSubmit(values: Omit<Fournisseur, "id">) {
    if (editing) {
      await updateFournisseur(editing.id, values)
      toast.success(t("fournisseurs.toastModified"))
    } else {
      await addFournisseur(values)
      toast.success(t("fournisseurs.toastCreated"))
    }
  }

  function confirmDelete() {
    if (!deleting) return
    deleteFournisseur(deleting.id)
    toast.success(t("fournisseurs.toastDeleted"))
    setDeleting(null)
  }

  const columns: DataTableColumn<Fournisseur>[] = [
    { key: "id", label: t("fournisseurs.colId"), render: (f) => <span className="font-mono text-xs text-muted-foreground">{f.id.toUpperCase()}</span> },
    {
      key: "nom",
      label: t("fournisseurs.colSupplier"),
      render: (f) => {
        const Icon = CATEGORIE_ICONS[f.categorie]
        return (
          <Link to={`/app/fournisseurs/${f.id}`} className="flex min-w-0 items-center gap-2.5 hover:text-primary">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium text-foreground">{f.nom}</span>
              <span className="block truncate text-xs text-muted-foreground">{f.contact}</span>
            </span>
          </Link>
        )
      },
    },
    { key: "categorie", label: t("fournisseurs.colCategory"), render: (f) => <StatusBadge label={t(CATEGORIE_LABEL_KEYS[f.categorie])} tone={CATEGORIE_TONES[f.categorie]} /> },
    { key: "achats", label: t("fournisseurs.colPurchases"), render: (f) => <span className="tabular-nums">{formatCurrency(summaryOf(f.id).totalAchats)}</span> },
    {
      key: "dernier",
      label: t("fournisseurs.colLastPurchase"),
      render: (f) => {
        const last = summaryOf(f.id).dernierAchat
        return last ? formatDate(last) : <span className="text-muted-foreground">{t("fournisseurs.never")}</span>
      },
    },
    { key: "note", label: t("fournisseurs.colRating"), render: (f) => <Rating value={f.note} /> },
    {
      key: "statut",
      label: t("fournisseurs.colStatus"),
      render: (f) => (
        <StatusBadge
          label={f.statut === "actif" ? t("fournisseurs.statusActive") : t("fournisseurs.statusInactive")}
          tone={f.statut === "actif" ? "success" : "muted"}
        />
      ),
    },
    ...(canEdit
      ? [{
          key: "actions", label: "", className: "text-right", sticky: true,
          render: (f: Fournisseur) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" onClick={() => { setEditing(f); setFormOpen(true) }} aria-label={`${t("common.edit")} ${f.nom}`}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleting(f)} aria-label={`${t("common.delete")} ${f.nom}`}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        } as DataTableColumn<Fournisseur>]
      : []),
  ]

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">{t("fournisseurs.pageTitle")}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{t("fournisseurs.pageSubtitle")}</p>

      {!canEdit && <ReadOnlyBanner />}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Truck} tone="primary"
          label={t("fournisseurs.statActive")}
          value={String(countActifs(fournisseurs))}
          hint={t("fournisseurs.statActiveHint", { total: fournisseurs.length })}
        />
        <StatCard
          icon={Wallet} tone="info"
          label={t("fournisseurs.statPurchasesYtd", { year })}
          value={formatCurrency(sumMontant(achatsYtd))}
          hint={t("fournisseurs.statPurchasesYtdHint", { count: achatsYtd.length })}
        />
        <StatCard
          icon={Clock} tone="warning"
          label={t("fournisseurs.statPending")}
          value={formatCurrency(sumEnAttente(achats))}
          hint={t("fournisseurs.statPendingHint", { count: enAttenteCount })}
        />
        <StatCard
          icon={Layers} tone="success"
          label={t("fournisseurs.statCategories")}
          value={String(countCategories(fournisseurs))}
          hint={t("fournisseurs.statCategoriesHint")}
        />
      </div>

      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("fournisseurs.searchPlaceholder")}
        filters={filters}
        view={{ value: view, onChange: setView }}
        actions={
          canEdit && (
            <Button onClick={() => { setEditing(null); setFormOpen(true) }} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("fournisseurs.newFournisseur")}</span>
            </Button>
          )
        }
      />

      <p className="mb-3 text-xs text-muted-foreground">{t("fournisseurs.resultCount", { count: filtered.length })}</p>

      {view === "list" ? (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(f) => f.id}
          isLoading={isLoading}
          emptyIcon={Truck}
          emptyTitle={t("fournisseurs.emptyTitle")}
          emptyDescription={t("fournisseurs.emptyDescription")}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Truck} title={t("fournisseurs.emptyTitle")} description={t("fournisseurs.emptyDescription")} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((fournisseur) => (
            <FournisseurCard key={fournisseur.id} fournisseur={fournisseur} summary={summaryOf(fournisseur.id)} />
          ))}
        </div>
      )}

      {canEdit && (
        <>
          <FournisseurFormDialog open={formOpen} onOpenChange={setFormOpen} editingFournisseur={editing} onSubmit={handleSubmit} />
          <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("fournisseurs.deleteConfirmTitle", { name: deleting?.nom })}</AlertDialogTitle>
                <AlertDialogDescription>{t("fournisseurs.deleteConfirmDescription")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t("common.delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  )
}
