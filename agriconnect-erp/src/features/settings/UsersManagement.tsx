import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Users as UsersIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useUsersStore } from "./usersStore"
import { UserFormDialog } from "./UserFormDialog"
import { ROLE_LABELS, ROLE_TONES } from "./roleLabels"
import type { User } from "@/types/user"
import type { UserFormValues } from "./userFormSchema"

export function UsersManagement() {
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
    } else {
      await addUser(values)
    }
     if (editingUser) {
    await updateUser(editingUser.id, values)
    toast.success("Utilisateur modifié")
  } else {
    await addUser(values)
    toast.success("Utilisateur ajouté")
  }
  }

  async function confirmDelete() {
    if (!deletingUser) return
    await deleteUser(deletingUser.id)
    setDeletingUser(null)
    if (!deletingUser) return
    await deleteUser(deletingUser.id)
    toast.success("Utilisateur supprimé")
    setDeletingUser(null)
  }

  const columns: DataTableColumn<User>[] = [
    {
      key: "name",
      label: "Nom",
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {u.avatarInitials}
          </span>
          {u.name}
        </div>
      ),
    },
    { key: "email", label: "Email", render: (u) => <span className="text-muted-foreground">{u.email}</span> },
    { key: "role", label: "Rôle", render: (u) => <StatusBadge label={ROLE_LABELS[u.role]} tone={ROLE_TONES[u.role]} /> },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (u) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(u)} aria-label={`Modifier ${u.name}`}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeletingUser(u)} aria-label={`Supprimer ${u.name}`}>
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
          Ajouter un utilisateur
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={users}
        rowKey={(u) => u.id}
        isLoading={isLoading}
        emptyIcon={UsersIcon}
        emptyTitle="Aucun utilisateur"
        emptyDescription="Ajoute le premier compte avec le bouton ci-dessus."
      />

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} editingUser={editingUser} onSubmit={handleSubmit} />

      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {deletingUser?.name} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le compte perdra immédiatement l'accès à AgriConnect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}