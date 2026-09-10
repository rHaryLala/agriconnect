import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { StatusBadge } from "@/components/shared/StatusBadge"

function buildSchema(t: (key: string) => string) {
  return z
    .object({
      currentPassword: z.string().min(1, t("settings.security.validationRequired")),
      newPassword: z.string().min(8, t("settings.security.validationMinLength")),
      confirmPassword: z.string().min(1, t("settings.security.validationRequired")),
    })
    .refine((v) => v.newPassword === v.confirmPassword, { message: t("settings.security.validationMismatch"), path: ["confirmPassword"] })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

export function SecuritySection() {
  const { t } = useTranslation()
  const schema = buildSchema(t)
  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function handleFormSubmit() {
    toast.info(t("settings.security.toastComingSoon"))
    reset()
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="rounded-xl border border-border bg-surface p-6">
        <p className="mb-1 text-sm font-semibold text-foreground">{t("settings.security.passwordTitle")}</p>
        <p className="mb-4 text-xs text-muted-foreground">{t("settings.security.passwordDescription")}</p>

        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="currentPassword">{t("settings.security.fieldCurrentPassword")}</Label>
            <input id="currentPassword" type="password" {...register("currentPassword")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            {errors.currentPassword && <p className="mt-1 text-xs text-destructive">{errors.currentPassword.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="newPassword">{t("settings.security.fieldNewPassword")}</Label>
              <input id="newPassword" type="password" {...register("newPassword")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              {errors.newPassword && <p className="mt-1 text-xs text-destructive">{errors.newPassword.message}</p>}
            </div>
            <div>
              <Label htmlFor="confirmPassword">{t("settings.security.fieldConfirmPassword")}</Label>
              <input id="confirmPassword" type="password" {...register("confirmPassword")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              {errors.confirmPassword && <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>{t("settings.security.submitButton")}</Button>
        </div>
      </form>

      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
              {t("settings.security.twoFaTitle")}
              <StatusBadge label={t("settings.security.comingSoon")} tone="warning" />
            </p>
            <p className="text-xs text-muted-foreground">{t("settings.security.twoFaDescription")}</p>
          </div>
          <Switch checked={false} disabled />
        </div>
      </div>
    </div>
  )
}
