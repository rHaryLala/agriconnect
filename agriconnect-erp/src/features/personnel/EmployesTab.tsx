import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, Users, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { EmployeFormDialog } from "./EmployeFormDialog"
import { usePersonnelStore } from "./personnelStore"
import { useClientsStore } from "@/features/clients/clientsStore"
import type { Employe } from "@/types/personnel"

export function EmployesTab({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation()
  const { employes, isLoading, fetchAll, addEmploye, updateEmploye, deleteEmploye } = usePersonnelStore()
  const { clients, fetchAll: fetchClients } = useClientsStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editingEmploye, setEditingEmploye] = useState<Employe | null>(null)

  useEffect(() => {
    fetchAll()
    fetchClients()
  }, [fetchAll, fetchClients])

  async function handleSubmit(values: Omit<Employe, "id">) {
    if (editingEmploye) {
      await updateEmploye(editingEmploye.id, values)
      toast.success(t("personnel.toastModified"))
    } else {
      await addEmploye(values)
      toast.success(t("personnel.toastCreated"))
    }
  }

  const columns: DataTableColumn<Employe>[] = [
    { key: "nom", label: t("personnel.fieldName"), render: (e) => e.nom },
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
      render: (e) => {
        const linked = clients.find((c) => c.id === e.clientId)
        if (!linked) return <span className="text-muted-foreground">—</span>
        return <StatusBadge label={t("personnel.fromClient")} tone="primary" />
      },
    },
    {
      key: "statut",
      label: t("personnel.fieldStatus"),
      render: (e) => <StatusBadge label={e.statut === "actif" ? t("personnel.statusActive") : t("personnel.statusInactive")} tone={e.statut === "actif" ? "success" : "muted"} />,
    },
    ...(canEdit
      ? [{
          key: "actions",
          label: "",
          className: "text-right",
          sticky: true,
          render: (e: Employe) => (
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditingEmploye(e)
                  setFormOpen(true)
                }}
                aria-label={t("common.edit")}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  deleteEmploye(e.id)
                  toast.success(t("personnel.toastDeleted"))
                }}
                aria-label={t("common.delete")}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        } as DataTableColumn<Employe>]
      : []),
  ]

  return (
    <div>
      {canEdit && (
        <div className="mb-3 flex justify-end">
          <Button
            onClick={() => {
              setEditingEmploye(null)
              setFormOpen(true)
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("personnel.newEmploye")}
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={employes}
        rowKey={(e) => e.id}
        isLoading={isLoading}
        emptyIcon={Users}
        emptyTitle={t("personnel.emptyTitle")}
        emptyDescription={t("personnel.emptyDescription")}
      />

      {canEdit && <EmployeFormDialog open={formOpen} onOpenChange={setFormOpen} editingEmploye={editingEmploye} clients={clients} onSubmit={handleSubmit} />}
    </div>
  )
}
