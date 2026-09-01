import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, Pencil, Trash2, Users as UsersIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useUsersStore } from "./usersStore"
import { UserFormDialog } from "./UserFormDialog"
import { ROLE_LABEL_KEYS, ROLE_TONES } from "./roleLabels"
import type { RowTone } from "@/lib/alerts"
import type { User } from "@/types/user"
import type { UserFormValues } from "./userFormSchema"

export function UsersManagement() {
  const { t } = useTranslation()
  const { users, isLoading, fetchUsers, addUser, updateUser, deleteUser } = useUsersStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  function openCreate() {
    setEditingUser(null)
    setFormOpen(true)
  }
  function openEdit(user: User) {
    setEditingUser(user)
    setFormOpen(true)
  }

  async function handleSubmit(values: UserFormValues) {
    if (editingUser) {
      await updateUser(editingUser.id, values)
      toast.success(t("settings.users.toastModified"))
    } else {
      await addUser(values)
      toast.success(t("settings.users.toastAdded"))
    }
  }

  async function confirmDelete() {
    if (!deletingUser) return
    await deleteUser(deletingUser.id)
    toast.success(t("settings.users.toastDeleted"))
    setDeletingUser(null)
  }

  function rowTone(u: User): RowTone {
    return u.role === "admin" ? "warning" : null
  }

  const columns: DataTableColumn<User>[] = [
    {
      key: "name", label: t("settings.users.colName"),
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{u.avatarInitials}</span>
          {u.name}
        </div>
      ),
    },
    { key: "email", label: t("settings.users.colEmail"), render: (u) => <span className="text-muted-foreground">{u.email}</span> },
    { key: "role", label: t("settings.users.colRole"), render: (u) => <StatusBadge label={t(ROLE_LABEL_KEYS[u.role])} tone={ROLE_TONES[u.role]} /> },
    {
      key: "actions", label: "", className: "text-right", sticky: true,
      render: (u) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(u)} aria-label={`${t("common.edit")} ${u.name}`}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeletingUser(u)} aria-label={`${t("common.delete")} ${u.name}`}>
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
          {t("settings.users.addButton")}
        </Button>
      </div>

      <DataTable columns={columns} rows={users} rowKey={(u) => u.id} isLoading={isLoading} emptyIcon={UsersIcon} emptyTitle={t("settings.users.emptyTitle")} emptyDescription={t("settings.users.emptyDescription")} rowTone={rowTone} />

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} editingUser={editingUser} onSubmit={handleSubmit} />

      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("settings.users.deleteConfirmTitle", { name: deletingUser?.name })}</AlertDialogTitle>
            <AlertDialogDescription>{t("settings.users.deleteConfirmDescription")}</AlertDialogDescription>
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