import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSettingsPreferencesStore } from "./settingsPreferencesStore"
import { useFarmConfigStore } from "./farmConfigStore"

interface SystemConfigSectionProps {
  canEdit: boolean
}

function buildSchema(t: (key: string) => string) {
  return z.object({
    nom: z.string().min(2, t("settings.system.validationRequired")),
    superficieHa: z.number({ error: t("stock.inventory.validationNumber") }).min(0),
    localisation: z.string().min(2, t("settings.system.validationRequired")),
    responsable: z.string().min(2, t("settings.system.validationRequired")),
  })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

export function SystemConfigSection({ canEdit }: SystemConfigSectionProps) {
  const { t } = useTranslation()
  const { systemBehavior, setSystemBehaviorPref } = useSettingsPreferencesStore()
  const { nom, superficieHa, localisation, responsable, setFarmConfig } = useFarmConfigStore()

  const schema = buildSchema(t)
  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    reset({ nom, superficieHa, localisation, responsable })
  }, [nom, superficieHa, localisation, responsable, reset])

  const behaviorRows: { key: keyof typeof systemBehavior }[] = [
    { key: "autoBackup" },
    { key: "auditLog" },
    { key: "maintenanceMode" },
    { key: "debugMode" },
  ]

  async function handleFormSubmit(values: FormValues) {
    setFarmConfig(values)
    toast.success(t("settings.system.toastFarmSaved"))
  }

  const inputClass = "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"

  return (
    <div className="flex flex-col gap-6">
      {!canEdit && <p className="text-xs text-muted-foreground">{t("settings.system.readOnlyHint")}</p>}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="rounded-xl border border-border bg-surface p-6">
        <p className="mb-1 text-sm font-semibold text-foreground">{t("settings.system.farmTitle")}</p>
        <p className="mb-4 text-xs text-muted-foreground">{t("settings.system.farmDescription")}</p>

        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="nom">{t("settings.system.fieldFarmName")}</Label>
            <input id="nom" {...register("nom")} disabled={!canEdit} className={inputClass} />
            {errors.nom && <p className="mt-1 text-xs text-destructive">{errors.nom.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="superficieHa">{t("settings.system.fieldArea")}</Label>
              <input id="superficieHa" type="number" step="0.1" {...register("superficieHa", { valueAsNumber: true })} disabled={!canEdit} className={inputClass} />
              {errors.superficieHa && <p className="mt-1 text-xs text-destructive">{errors.superficieHa.message}</p>}
            </div>
            <div>
              <Label htmlFor="localisation">{t("settings.system.fieldLocation")}</Label>
              <input id="localisation" {...register("localisation")} disabled={!canEdit} className={inputClass} />
              {errors.localisation && <p className="mt-1 text-xs text-destructive">{errors.localisation.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="responsable">{t("settings.system.fieldManager")}</Label>
            <input id="responsable" {...register("responsable")} disabled={!canEdit} className={inputClass} />
            {errors.responsable && <p className="mt-1 text-xs text-destructive">{errors.responsable.message}</p>}
          </div>
        </div>

        {canEdit && (
          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSubmitting || !isDirty} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("common.save")}
            </Button>
          </div>
        )}
      </form>

      <div className="rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-6 py-4">
          <p className="text-sm font-semibold text-foreground">{t("settings.system.behaviorTitle")}</p>
          <p className="text-xs text-muted-foreground">{t("settings.system.behaviorDescription")}</p>
        </div>
        {behaviorRows.map(({ key }, i) => (
          <div key={key} className={`flex items-center justify-between gap-4 px-6 py-4 ${i > 0 ? "border-t border-border" : ""}`}>
            <div>
              <p className="text-sm font-medium text-foreground">{t(`settings.system.${key}Title`)}</p>
              <p className="text-xs text-muted-foreground">{t(`settings.system.${key}Description`)}</p>
            </div>
            <Switch
              checked={systemBehavior[key]}
              disabled={!canEdit}
              onCheckedChange={(checked) => setSystemBehaviorPref(key, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
