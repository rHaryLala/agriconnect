import { useEffect, useMemo } from "react"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { RizSechageEvent, RizSechageType } from "@/types/production"

function buildSchema(t: (key: string) => string) {
  return z.object({
    date: z.string().min(1, t("stock.movements.validationDate")),
    type: z.enum(["passage", "finalisation"]),
    quantiteSortie: z.number().min(0).optional(),
    quantiteRetournee: z.number().min(0).optional(),
    sacs: z.number().min(0).optional(),
    quantiteKg: z.number().min(0).optional(),
    observation: z.string(),
  })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

interface RizSechageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<RizSechageEvent, "id">) => Promise<void>
}

export function RizSechageDialog({ open, onOpenChange, onSubmit }: RizSechageDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const {
    register, handleSubmit, control, reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) reset({ date: new Date().toISOString().slice(0, 10), type: "passage", quantiteSortie: 0, quantiteRetournee: 0, sacs: 0, quantiteKg: 0, observation: "" })
  }, [open, reset])

  const type = useWatch({ control, name: "type" })

  async function handleFormSubmit(values: FormValues) {
    await onSubmit({
      date: values.date,
      type: values.type as RizSechageType,
      quantiteSortie: values.type === "passage" ? values.quantiteSortie : undefined,
      quantiteRetournee: values.type === "passage" ? values.quantiteRetournee : undefined,
      sacs: values.type === "finalisation" ? values.sacs : undefined,
      quantiteKg: values.type === "finalisation" ? values.quantiteKg : undefined,
      observation: values.observation,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("production.riz.sechageDialogTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="type">{t("production.riz.fieldSechageType")}</Label>
            <Controller
              name="type" control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" className="mt-1.5">
                    <SelectValue>{(v: string) => t(v === "finalisation" ? "production.riz.sechageTypeFinalisation" : "production.riz.sechageTypePassage")}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passage">{t("production.riz.sechageTypePassage")}</SelectItem>
                    <SelectItem value="finalisation">{t("production.riz.sechageTypeFinalisation")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <Label htmlFor="date">{t("production.riz.fieldDate")}</Label>
            <input id="date" type="date" {...register("date")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>

          {type === "passage" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="quantiteSortie">{t("production.riz.fieldQuantiteSortie")}</Label>
                <input id="quantiteSortie" type="number" {...register("quantiteSortie", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <Label htmlFor="quantiteRetournee">{t("production.riz.fieldQuantiteRetournee")}</Label>
                <input id="quantiteRetournee" type="number" {...register("quantiteRetournee", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sacs">{t("production.riz.fieldSacs")}</Label>
                <input id="sacs" type="number" {...register("sacs", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <Label htmlFor="quantiteKg">{t("production.riz.fieldQuantiteKg")}</Label>
                <input id="quantiteKg" type="number" {...register("quantiteKg", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          )}

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
