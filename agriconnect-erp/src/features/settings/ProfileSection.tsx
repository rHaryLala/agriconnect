import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useAuthStore } from "@/features/auth/authStore"
import { useUsersStore } from "./usersStore"
import { ROLE_LABEL_KEYS, ROLE_TONES } from "./roleLabels"

function buildSchema(t: (key: string) => string) {
  return z.object({
    firstName: z.string().min(2, t("settings.users.validationName")),
    lastName: z.string().min(1, t("settings.users.validationName")),
  })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

function splitName(fullName: string): { firstName: string; lastName: string } {
  const [firstName, ...rest] = fullName.trim().split(/\s+/)
  return { firstName: firstName ?? "", lastName: rest.join(" ") }
}

export function ProfileSection() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const setAuthUser = useAuthStore((s) => s.updateUser)
  const updateUser = useUsersStore((s) => s.updateUser)

  const schema = buildSchema(t)
  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (user) reset(splitName(user.name))
  }, [user, reset])

  if (!user) return null

  async function handleFormSubmit(values: FormValues) {
    if (!user) return
    const name = `${values.firstName} ${values.lastName}`.trim()
    const updated = await updateUser(user.id, { name, email: user.email, role: user.role })
    setAuthUser(updated)
    toast.success(t("settings.profile.toastSaved"))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="mb-1 text-sm font-semibold text-foreground">{t("settings.profile.avatarTitle")}</p>
        <p className="mb-4 text-xs text-muted-foreground">{t("settings.profile.avatarDescription")}</p>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary">
            {user.avatarInitials}
          </div>
          <p className="text-xs text-muted-foreground">{t("settings.profile.avatarHint")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="rounded-xl border border-border bg-surface p-6">
        <p className="mb-1 text-sm font-semibold text-foreground">{t("settings.profile.infoTitle")}</p>
        <p className="mb-4 text-xs text-muted-foreground">{t("settings.profile.infoDescription")}</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">{t("settings.profile.fieldFirstName")}</Label>
            <input id="firstName" {...register("firstName")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>}
          </div>
          <div>
            <Label htmlFor="lastName">{t("settings.profile.fieldLastName")}</Label>
            <input id="lastName" {...register("lastName")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="email">{t("settings.profile.fieldEmail")}</Label>
          <input id="email" value={user.email} disabled className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground outline-none" />
          <p className="mt-1 text-xs text-muted-foreground">{t("settings.profile.emailHint")}</p>
        </div>

        <div className="mt-4">
          <Label>{t("settings.profile.fieldRole")}</Label>
          <div className="mt-1.5">
            <StatusBadge label={t(ROLE_LABEL_KEYS[user.role])} tone={ROLE_TONES[user.role]} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t("settings.profile.roleHint")}</p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => reset(splitName(user.name))} disabled={!isDirty}>{t("common.cancel")}</Button>
          <Button type="submit" disabled={isSubmitting || !isDirty} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("common.save")}
          </Button>
        </div>
      </form>
    </div>
  )
}
