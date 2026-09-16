import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, Users, Pencil, Trash2, Handshake, Building2, IdCard, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ListToolbar, type ToolbarFilter } from "@/components/shared/ListToolbar"
import { EmptyState } from "@/components/shared/EmptyState"
import type { ViewMode } from "@/components/shared/ViewToggle"
import { ClientCard } from "./ClientCard"
import { ClientFormDialog } from "./ClientFormDialog"
import { useClientsStore } from "./clientsStore"
import { CLIENT_TYPE_LABEL_KEYS, CLIENT_TYPE_TONES } from "./clientLabels"
import { CLIENT_TYPES, type Client } from "@/types/client"

const ALL = "tous"
const INTERNAL_TYPES = ["cafeteria", "store", "production"]

function matches(client: Client, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return (
    client.nom.toLowerCase().includes(needle) ||
    !!client.telephone?.toLowerCase().includes(needle) ||
    !!client.matriculeUaz?.toLowerCase().includes(needle)
  )
}

export function ClientsListTab({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation()
  const { clients, isLoading, fetchAll, addClient, updateClient, deleteClient } = useClientsStore()

  const [formOpen, setFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState(ALL)
  const [view, setView] = useState<ViewMode>("list")

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const filtered = useMemo(
    () => clients.filter((client) => matches(client, search) && (typeFilter === ALL || client.type === typeFilter)),
    [clients, search, typeFilter],
  )

  const internalCount = clients.filter((client) => INTERNAL_TYPES.includes(client.type)).length
  const staffCount = clients.filter((client) => client.type === "personnel").length
  const externalCount = clients.filter((client) => client.type === "externe").length

  const filters: ToolbarFilter[] = [
    {
      id: "type",
      label: t("clients.filterType"),
      value: typeFilter,
      onChange: setTypeFilter,
      options: [
        { value: ALL, label: t("common.filterAll") },
        ...CLIENT_TYPES.map((value) => ({ value, label: t(CLIENT_TYPE_LABEL_KEYS[value]) })),
      ],
    },
  ]

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

  function confirmDelete() {
    if (!deletingClient) return
    deleteClient(deletingClient.id)
    toast.success(t("clients.toastDeleted"))
    setDeletingClient(null)
  }

  const columns: DataTableColumn<Client>[] = [
    { key: "nom", label: t("clients.colName"), render: (c) => <span className="font-medium text-foreground">{c.nom}</span> },
    { key: "type", label: t("clients.colType"), render: (c) => <StatusBadge label={t(CLIENT_TYPE_LABEL_KEYS[c.type])} tone={CLIENT_TYPE_TONES[c.type]} /> },
    { key: "telephone", label: t("clients.colPhone"), render: (c) => c.telephone || <span className="text-muted-foreground">—</span> },
    { key: "matricule", label: t("clients.colMatricule"), render: (c) => c.matriculeUaz || <span className="text-muted-foreground">—</span> },
    ...(canEdit
      ? [{
          key: "actions", label: "", className: "text-right", sticky: true,
          render: (c: Client) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label={`${t("common.edit")} ${c.nom}`}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setDeletingClient(c)} aria-label={`${t("common.delete")} ${c.nom}`}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        } as DataTableColumn<Client>]
      : []),
  ]

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Handshake} tone="primary" label={t("clients.statTotal")} value={String(clients.length)} hint={t("clients.statTotalHint")} />
        <StatCard icon={Store} tone="info" label={t("clients.statInternal")} value={String(internalCount)} hint={t("clients.statInternalHint")} />
        <StatCard icon={IdCard} tone="warning" label={t("clients.statStaff")} value={String(staffCount)} hint={t("clients.statStaffHint")} />
        <StatCard icon={Building2} tone="success" label={t("clients.statExternal")} value={String(externalCount)} hint={t("clients.statExternalHint")} />
      </div>

      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("clients.searchPlaceholder")}
        filters={filters}
        view={{ value: view, onChange: setView }}
        actions={
          canEdit && (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("clients.newClient")}</span>
            </Button>
          )
        }
      />

      {view === "list" ? (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(c) => c.id}
          isLoading={isLoading}
          emptyIcon={Users}
          emptyTitle={t("clients.emptyTitle")}
          emptyDescription={t("clients.emptyDescription")}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title={t("clients.emptyTitle")} description={t("clients.emptyDescription")} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((client) => (
            <ClientCard key={client.id} client={client} canEdit={canEdit} onEdit={openEdit} onDelete={setDeletingClient} />
          ))}
        </div>
      )}

      {canEdit && (
        <>
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
        </>
      )}
    </div>
  )
}
