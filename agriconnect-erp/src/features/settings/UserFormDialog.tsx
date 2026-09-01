import { useEffect, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ROLE_LABEL_KEYS } from "./roleLabels"
import type { User } from "@/types/user"

function buildSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(2, t("settings.users.validationName")),
    email: z.string().min(1, t("stock.movements.validationArticle")).email(t("settings.users.validationEmail")),
    role: z.enum(["admin", "comptable", "ouvrier"], { error: t("settings.users.validationRole") }),
  })
}
type UserFormValues = z.infer<ReturnType<typeof buildSchema>>

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingUser: User | null
  onSubmit: (values: UserFormValues) => Promise<void>
}

export function UserFormDialog({ open, onOpenChange, editingUser, onSubmit }: UserFormDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const {
    register, handleSubmit, control, reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) {
      reset(editingUser ? { name: editingUser.name, email: editingUser.email, role: editingUser.role } : { name: "", email: "", role: undefined })
    }
  }, [open, editingUser, reset])

  async function handleFormSubmit(values: UserFormValues) {
    await onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingUser ? t("settings.users.dialogTitleEdit") : t("settings.users.dialogTitleNew")}</DialogTitle>
        </DialogHeader>

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
            <Label htmlFor="role">{t("settings.users.fieldRole")}</Label>
            <Controller
              name="role" control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="role" className="mt-1.5">
                    <SelectValue placeholder={t("settings.users.fieldRolePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABEL_KEYS).map(([value, labelKey]) => (
                      <SelectItem key={value} value={value}>{t(labelKey)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && <p className="mt-1 text-xs text-destructive">{errors.role.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingUser ? t("common.save") : t("common.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}