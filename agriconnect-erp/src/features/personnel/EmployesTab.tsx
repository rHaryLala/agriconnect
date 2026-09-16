import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, Users, Pencil, Trash2, UserCheck, UserMinus, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { ListToolbar, type ToolbarFilter } from "@/components/shared/ListToolbar"
import { EmptyState } from "@/components/shared/EmptyState"
import type { ViewMode } from "@/components/shared/ViewToggle"
import { EmployeCard } from "./EmployeCard"
import { EmployeFormDialog } from "./EmployeFormDialog"
import { usePersonnelStore } from "./personnelStore"
import { useClientsStore } from "@/features/clients/clientsStore"
import type { Employe } from "@/types/personnel"

const ALL = "tous"

function matches(employe: Employe, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return (
    employe.nom.toLowerCase().includes(needle) ||
    employe.fonction.toLowerCase().includes(needle) ||
    employe.departement.toLowerCase().includes(needle) ||
    !!employe.matriculeUaz?.toLowerCase().includes(needle) ||
    !!employe.telephone?.toLowerCase().includes(needle)
  )
}

export function EmployesTab({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation()
  const { employes, isLoading, fetchAll, addEmploye, updateEmploye, deleteEmploye } = usePersonnelStore()
  const { clients, fetchAll: fetchClients } = useClientsStore()

  const [formOpen, setFormOpen] = useState(false)
  const [editingEmploye, setEditingEmploye] = useState<Employe | null>(null)
  const [deletingEmploye, setDeletingEmploye] = useState<Employe | null>(null)
  const [search, setSearch] = useState("")
  const [departement, setDepartement] = useState(ALL)
  const [statut, setStatut] = useState(ALL)
  const [view, setView] = useState<ViewMode>("list")

  useEffect(() => {
    fetchAll()
    fetchClients()
  }, [fetchAll, fetchClients])

  const departements = useMemo(
    () => [...new Set(employes.map((employe) => employe.departement).filter(Boolean))].sort(),
    [employes],
  )

  const filtered = useMemo(
    () =>
      employes.filter(
        (employe) =>
          matches(employe, search) &&
          (departement === ALL || employe.departement === departement) &&
          (statut === ALL || employe.statut === statut),
      ),
    [employes, search, departement, statut],
  )

  const activeCount = employes.filter((employe) => employe.statut === "actif").length
  const isLinked = (employe: Employe) => !!employe.clientId && clients.some((client) => client.id === employe.clientId)

  const filters: ToolbarFilter[] = [
    {
      id: "departement",
      label: t("personnel.filterDepartment"),
      value: departement,
      onChange: setDepartement,
      options: [{ value: ALL, label: t("common.filterAll") }, ...departements.map((value) => ({ value, label: value }))],
    },
    {
      id: "statut",
      label: t("personnel.filterStatus"),
      value: statut,
      onChange: setStatut,
      options: [
        { value: ALL, label: t("common.filterAll") },
        { value: "actif", label: t("personnel.statusActive") },
        { value: "inactif", label: t("personnel.statusInactive") },
      ],
    },
  ]

  function openCreate() {
    setEditingEmploye(null)
    setFormOpen(true)
  }

  function openEdit(employe: Employe) {
    setEditingEmploye(employe)
    setFormOpen(true)
  }

  async function handleSubmit(values: Omit<Employe, "id">) {
    if (editingEmploye) {
      await updateEmploye(editingEmploye.id, values)
      toast.success(t("personnel.toastModified"))
    } else {
      await addEmploye(values)
      toast.success(t("personnel.toastCreated"))
    }
  }

  function confirmDelete() {
    if (!deletingEmploye) return
    deleteEmploye(deletingEmploye.id)
    toast.success(t("personnel.toastDeleted"))
    setDeletingEmploye(null)
  }

  const columns: DataTableColumn<Employe>[] = [
    { key: "nom", label: t("personnel.fieldName"), render: (e) => <span className="font-medium text-foreground">{e.nom}</span> },
    { key: "fonction", label: t("personnel.fieldRole"), render: (e) => e.fonction || <span className="text-muted-foreground">—</span> },
    {
      key: "departement",
      label: t("personnel.fieldDepartment"),
      render: (e) => (e.departement ? <StatusBadge label={e.departement} tone="info" /> : <span className="text-muted-foreground">—</span>),
    },
    { key: "telephone", label: t("personnel.fieldPhone"), render: (e) => e.telephone || <span className="text-muted-foreground">—</span> },
    { key: "matricule", label: t("personnel.fieldMatricule"), render: (e) => e.matriculeUaz || <span className="text-muted-foreground">—</span> },
    {
      key: "client",
      label: t("personnel.fieldClient"),
      render: (e) => (isLinked(e) ? <StatusBadge label={t("personnel.fromClient")} tone="primary" /> : <span className="text-muted-foreground">—</span>),
    },
    {
      key: "statut",
      label: t("personnel.fieldStatus"),
      render: (e) => (
        <StatusBadge
          label={e.statut === "actif" ? t("personnel.statusActive") : t("personnel.statusInactive")}
          tone={e.statut === "actif" ? "success" : "muted"}
        />
      ),
    },
    ...(canEdit
      ? [{
          key: "actions", label: "", className: "text-right", sticky: true,
          render: (e: Employe) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(e)} aria-label={`${t("common.edit")} ${e.nom}`}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setDeletingEmploye(e)} aria-label={`${t("common.delete")} ${e.nom}`}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        } as DataTableColumn<Employe>]
      : []),
  ]

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Users} tone="primary" label={t("personnel.statTotal")} value={String(employes.length)} hint={t("personnel.statTotalHint")} />
        <StatCard icon={UserCheck} tone="success" label={t("personnel.statActive")} value={String(activeCount)} hint={t("personnel.statActiveHint")} />
        <StatCard icon={UserMinus} tone="warning" label={t("personnel.statInactive")} value={String(employes.length - activeCount)} hint={t("personnel.statInactiveHint")} />
        <StatCard icon={Building2} tone="info" label={t("personnel.statDepartments")} value={String(departements.length)} hint={t("personnel.statDepartmentsHint")} />
      </div>

      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("personnel.searchPlaceholder")}
        filters={filters}
        view={{ value: view, onChange: setView }}
        actions={
          canEdit && (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("personnel.newEmploye")}</span>
            </Button>
          )
        }
      />

      {view === "list" ? (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(e) => e.id}
          isLoading={isLoading}
          emptyIcon={Users}
          emptyTitle={t("personnel.emptyTitle")}
          emptyDescription={t("personnel.emptyDescription")}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title={t("personnel.emptyTitle")} description={t("personnel.emptyDescription")} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((employe) => (
            <EmployeCard
              key={employe.id}
              employe={employe}
              linkedToClient={isLinked(employe)}
              canEdit={canEdit}
              onEdit={openEdit}
              onDelete={setDeletingEmploye}
            />
          ))}
        </div>
      )}

      {canEdit && (
        <>
          <EmployeFormDialog open={formOpen} onOpenChange={setFormOpen} editingEmploye={editingEmploye} clients={clients} onSubmit={handleSubmit} />
          <AlertDialog open={!!deletingEmploye} onOpenChange={(open) => !open && setDeletingEmploye(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("personnel.deleteConfirmTitle", { name: deletingEmploye?.nom })}</AlertDialogTitle>
                <AlertDialogDescription>{t("personnel.deleteConfirmDescription")}</AlertDialogDescription>
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
