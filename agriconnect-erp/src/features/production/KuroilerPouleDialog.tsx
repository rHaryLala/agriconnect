import { useEffect, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import type { KuroilerPoule } from "@/types/production"

function buildSchema(t: (key: string) => string) {
  return z.object({
    bracelet: z.string().min(1, t("production.kuroiler.registry.validationBracelet")),
    dateEntree: z.string().min(1, t("stock.movements.validationDate")),
    ageMois: z.number({ error: t("stock.inventory.validationNumber") }).min(0),
    ponte: z.boolean(),
    observation: z.string(),
  })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

const INPUT_CLASS =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"

interface KuroilerPouleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingPoule: KuroilerPoule | null
  onSubmit: (values: Omit<KuroilerPoule, "id" | "statut">) => Promise<void>
}

export function KuroilerPouleDialog({ open, onOpenChange, editingPoule, onSubmit }: KuroilerPouleDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) {
      reset({
        bracelet: editingPoule?.bracelet ?? "",
        dateEntree: editingPoule?.dateEntree ?? new Date().toISOString().slice(0, 10),
        ageMois: editingPoule?.ageMois ?? 0,
        ponte: editingPoule?.ponte ?? false,
        observation: editingPoule?.observation ?? "",
      })
    }
  }, [open, editingPoule, reset])

  async function handleFormSubmit(values: FormValues) {
    await onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingPoule ? t("production.kuroiler.registry.dialogTitleEdit") : t("production.kuroiler.registry.dialogTitleNew")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="bracelet">{t("production.kuroiler.registry.fieldBracelet")}</Label>
            <input id="bracelet" {...register("bracelet")} placeholder={t("production.kuroiler.registry.fieldBraceletPlaceholder")} className={INPUT_CLASS} />
            {errors.bracelet && <p className="mt-1 text-xs text-destructive">{errors.bracelet.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="dateEntree">{t("production.kuroiler.registry.fieldDateEntree")}</Label>
              <input id="dateEntree" type="date" {...register("dateEntree")} className={INPUT_CLASS} />
              {errors.dateEntree && <p className="mt-1 text-xs text-destructive">{errors.dateEntree.message}</p>}
            </div>
            <div>
              <Label htmlFor="ageMois">{t("production.kuroiler.registry.fieldAge")}</Label>
              <input id="ageMois" type="number" {...register("ageMois", { valueAsNumber: true })} className={INPUT_CLASS} />
              {errors.ageMois && <p className="mt-1 text-xs text-destructive">{errors.ageMois.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
            <Label htmlFor="ponte" className="cursor-pointer">
              {t("production.kuroiler.registry.fieldLaying")}
            </Label>
            <Controller name="ponte" control={control} render={({ field }) => <Switch id="ponte" checked={field.value} onCheckedChange={field.onChange} />} />
          </div>

          <div>
            <Label htmlFor="observation">{t("production.common.observation")}</Label>
            <textarea id="observation" rows={2} {...register("observation")} placeholder={t("production.common.observationPlaceholder")} className={INPUT_CLASS} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
