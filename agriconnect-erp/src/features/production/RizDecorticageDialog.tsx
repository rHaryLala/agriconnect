import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { RizDecorticage } from "@/types/production"

function buildSchema(t: (key: string) => string) {
  return z.object({
    date: z.string().min(1, t("stock.movements.validationDate")),
    quantitePaddyKg: z.number({ error: t("stock.inventory.validationNumber") }).positive(),
    quantiteRizKg: z.number({ error: t("stock.inventory.validationNumber") }).positive(),
    observation: z.string(),
  })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

interface RizDecorticageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stockPaddySeche: number
  onSubmit: (data: Omit<RizDecorticage, "id">) => Promise<void>
}

export function RizDecorticageDialog({ open, onOpenChange, stockPaddySeche, onSubmit }: RizDecorticageDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) reset({ date: new Date().toISOString().slice(0, 10), quantitePaddyKg: 0, quantiteRizKg: 0, observation: "" })
  }, [open, reset])

  async function handleFormSubmit(values: FormValues) {
    if (values.quantitePaddyKg > stockPaddySeche) {
      alert(t("production.riz.insufficientStockPaddySeche", { available: stockPaddySeche, requested: values.quantitePaddyKg }))
      return
    }
    await onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("production.riz.decorticageDialogTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="date">{t("production.riz.fieldDate")}</Label>
            <input id="date" type="date" {...register("date")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>

          <div>
            <Label htmlFor="quantitePaddyKg">{t("production.riz.fieldQuantitePaddyUtilisee")} <span className="text-muted-foreground/70">({t("production.riz.available", { value: stockPaddySeche })})</span></Label>
            <input id="quantitePaddyKg" type="number" {...register("quantitePaddyKg", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            {errors.quantitePaddyKg && <p className="mt-1 text-xs text-destructive">{errors.quantitePaddyKg.message}</p>}
          </div>

          <div>
            <Label htmlFor="quantiteRizKg">{t("production.riz.fieldQuantiteRizObtenu")}</Label>
            <input id="quantiteRizKg" type="number" {...register("quantiteRizKg", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            {errors.quantiteRizKg && <p className="mt-1 text-xs text-destructive">{errors.quantiteRizKg.message}</p>}
          </div>

          <div>
            <Label htmlFor="observation">{t("production.common.observation")}</Label>
            <textarea id="observation" {...register("observation")} placeholder={t("production.common.observationPlaceholder")} rows={2} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
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
