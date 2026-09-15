import { useMemo, useState } from "react"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { PermissionChecklist } from "./PermissionChecklist"
import { permissionsForRole, type Permission } from "@/lib/permissions"
import { ROLE_LABEL_KEYS, ROLE_ICONS, STATUS_LABEL_KEYS } from "./roleLabels"
import type { User, UserRole, UserStatus } from "@/types/user"

function buildSchema(t: (key: string) => string, isEditing: boolean) {
  return z.object({
    name: z.string().min(2, t("settings.users.validationName")),
    email: z.string().min(1, t("stock.movements.validationArticle")).email(t("settings.users.validationEmail")),
    role: z.enum(["admin", "comptable", "ouvrier", "magasinier", "controleur_interne"], { error: () => t("settings.users.validationRole") }),
    status: z.enum(["actif", "inactif", "suspendu"]),
    password: isEditing
      ? z.string().optional().or(z.literal(""))
      : z.string().min(8, t("settings.security.validationMinLength")),
  })
}

type UserFormValues = z.infer<ReturnType<typeof buildSchema>>

type SubmitUser = (values: UserFormValues, permissions: Permission[] | undefined) => Promise<void>

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingUser: User | null
  permissionOverride?: Permission[]
  onSubmit: SubmitUser
}

interface UserFormProps {
  editingUser: User | null
  permissionOverride?: Permission[]
  onSubmit: SubmitUser
  onCancel: () => void
}

function defaultValuesFor(editingUser: User | null) {
  if (!editingUser) {
    return { name: "", email: "", role: undefined, status: "actif" as UserStatus, password: "" }
  }
  return {
    name: editingUser.name,
    email: editingUser.email,
    role: editingUser.role,
    status: editingUser.status ?? "actif",
    password: "",
  }
}

function UserForm({ editingUser, permissionOverride, onSubmit, onCancel }: UserFormProps) {
  const { t } = useTranslation()
  const isEditing = !!editingUser
  const schema = useMemo(() => buildSchema(t, isEditing), [t, isEditing])

  const {
    register, handleSubmit, control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValuesFor(editingUser),
  })

  const [useRolePreset, setUseRolePreset] = useState(!permissionOverride)
  const [customPermissions, setCustomPermissions] = useState<Permission[]>(
    () => permissionOverride ?? permissionsForRole(editingUser?.role),
  )

  const role = useWatch({ control, name: "role" })
  const permissions = useRolePreset ? permissionsForRole(role) : customPermissions

  function handlePresetToggle(next: boolean) {
    if (!next) setCustomPermissions(permissions)
    setUseRolePreset(next)
  }

  async function handleFormSubmit(values: UserFormValues) {
    const payload = { ...values }
    if (isEditing && !payload.password) {
      delete payload.password
    }

    try {
      await onSubmit(payload, useRolePreset ? undefined : permissions)
      onCancel()
    } catch {
      toast.error(t("settings.users.toastError"))
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">{t("settings.users.fieldName")}</Label>
        <input
          id="name" {...register("name")} aria-invalid={!!errors.name}
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder={t("settings.users.fieldNamePlaceholder")}
        />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">{t("settings.users.fieldEmail")}</Label>
        <input
          id="email" type="email" {...register("email")} aria-invalid={!!errors.email}
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder={t("settings.users.fieldEmailPlaceholder")}
        />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="password">
          {isEditing ? t("settings.users.fieldPasswordEdit") : t("settings.users.fieldPassword")}
        </Label>
        <input
          id="password" type="password" {...register("password")} aria-invalid={!!errors.password}
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder={isEditing ? t("settings.users.fieldPasswordEditPlaceholder") : t("settings.users.fieldPasswordPlaceholder")}
        />
        {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="role">{t("settings.users.fieldRole")}</Label>
          <Controller
            name="role" control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="role" className="mt-1.5 w-full">
                  <SelectValue placeholder={t("settings.users.fieldRolePlaceholder")}>
                    {(value: UserRole | null) => (value ? t(ROLE_LABEL_KEYS[value]) : t("settings.users.fieldRolePlaceholder"))}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_LABEL_KEYS) as UserRole[]).map((value) => {
                    const RoleIcon = ROLE_ICONS[value]
                    return (
                      <SelectItem key={value} value={value}>
                        <RoleIcon className="h-4 w-4 text-muted-foreground" />
                        {t(ROLE_LABEL_KEYS[value])}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && <p className="mt-1 text-xs text-destructive">{errors.role.message}</p>}
        </div>

        <div>
          <Label htmlFor="status">{t("settings.users.fieldStatus")}</Label>
          <Controller
            name="status" control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status" className="mt-1.5 w-full">
                  <SelectValue>
                    {(value: UserStatus | null) => t(STATUS_LABEL_KEYS[value ?? "actif"])}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABEL_KEYS) as UserStatus[]).map((value) => (
                    <SelectItem key={value} value={value}>{t(STATUS_LABEL_KEYS[value])}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label htmlFor="useRolePreset" className="cursor-pointer">
              {t("settings.users.useRolePreset")}
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("settings.users.useRolePresetHint")}</p>
          </div>
          <Switch id="useRolePreset" checked={useRolePreset} onCheckedChange={handlePresetToggle} />
        </div>

        <PermissionChecklist permissions={permissions} disabled={useRolePreset} onChange={setCustomPermissions} />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>{t("common.cancel")}</Button>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {editingUser ? t("common.save") : t("common.add")}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function UserFormDialog({ open, onOpenChange, editingUser, permissionOverride, onSubmit }: UserFormDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingUser ? t("settings.users.dialogTitleEdit") : t("settings.users.dialogTitleNew")}</DialogTitle>
        </DialogHeader>

        {open && (
          <UserForm
            key={editingUser?.id ?? "new"}
            editingUser={editingUser}
            permissionOverride={permissionOverride}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
