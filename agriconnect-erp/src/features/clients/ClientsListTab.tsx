import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, Pencil, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ClientFormDialog } from "./ClientFormDialog"
import { useClientsStore } from "./clientsStore"
import { CLIENT_TYPE_LABEL_KEYS, CLIENT_TYPE_TONES } from "./clientLabels"
import type { Client } from "@/types/client"

export function ClientsListTab() {
  const { t } = useTranslation()
  const { clients, isLoading, fetchAll, addClient, updateClient, deleteClient } = useClientsStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  function openCreate() {
    setEditingClient(null)
    setFormOpen(true)
  }
  function openEdit(client: Client) {
    setEditingClient(client)
    setFormOpen(true)
  }

  async function handleSubmit(values: Omit<Client, "id">) {
    if (editingClient) {
      await updateClient(editingClient.id, values)
      toast.success(t("clients.toastModified"))
    } else {
      await addClient(values)
      toast.success(t("clients.toastCreated"))
    }
  }

  async function confirmDelete() {
    if (!deletingClient) return
    deleteClient(deletingClient.id)
    toast.success(t("clients.toastDeleted"))
    setDeletingClient(null)
  }

  const columns: DataTableColumn<Client>[] = [
    { key: "nom", label: t("clients.colName"), render: (c) => c.nom },
    { key: "type", label: t("clients.colType"), render: (c) => <StatusBadge label={t(CLIENT_TYPE_LABEL_KEYS[c.type])} tone={CLIENT_TYPE_TONES[c.type]} /> },
    { key: "telephone", label: t("clients.colPhone"), render: (c) => c.telephone || <span className="text-muted-foreground">—</span> },
    { key: "matricule", label: t("clients.colMatricule"), render: (c) => c.matriculeUaz || <span className="text-muted-foreground">—</span> },
    {
      key: "actions", label: "", className: "text-right", sticky: true,
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label={`${t("common.edit")} ${c.nom}`}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeletingClient(c)} aria-label={`${t("common.delete")} ${c.nom}`}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("clients.newClient")}
        </Button>
      </div>

      <DataTable columns={columns} rows={clients} rowKey={(c) => c.id} isLoading={isLoading} emptyIcon={Users} emptyTitle={t("clients.emptyTitle")} emptyDescription={t("clients.emptyDescription")} />

      <ClientFormDialog open={formOpen} onOpenChange={setFormOpen} editingClient={editingClient} onSubmit={handleSubmit} />

      <AlertDialog open={!!deletingClient} onOpenChange={(open) => !open && setDeletingClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("clients.deleteConfirmTitle", { name: deletingClient?.nom })}</AlertDialogTitle>
            <AlertDialogDescription>{t("clients.deleteConfirmDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}