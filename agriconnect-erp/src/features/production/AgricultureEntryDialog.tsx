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
import type { CultureTypeProfile } from "./cultureTypesStore"
import type { CultureEntry } from "@/types/production"

function buildSchema(t: (key: string) => string) {
  return z.object({
    date: z.string().min(1, t("stock.movements.validationDate")),
    culture: z.string().min(1, t("stock.movements.validationArticle")),
    surfaceHa: z.number({ invalid_type_error: t("stock.inventory.validationNumber") }).positive(t("stock.movements.validationQuantity")),
    recolteQty: z.number({ invalid_type_error: t("stock.inventory.validationNumber") }).min(0),
    coutIntrants: z.number({ invalid_type_error: t("stock.inventory.validationNumber") }).min(0),
    intrants: z.string().min(1, t("production.agriculture.validationInputs")),
  })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

interface AgricultureEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cultures: CultureTypeProfile[]
  editingEntry?: CultureEntry | null
  onSubmit: (values: Omit<CultureEntry, "id">) => Promise<void>
}

export function AgricultureEntryDialog({ open, onOpenChange, cultures, editingEntry, onSubmit }: AgricultureEntryDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const {
    register, handleSubmit, control, watch, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) {
      reset({
        date: editingEntry?.date ?? new Date().toISOString().slice(0, 10),
        culture: editingEntry?.culture ?? cultures[0]?.nom ?? "",
        surfaceHa: editingEntry?.surfaceHa ?? 0,
        recolteQty: editingEntry?.recolteQty ?? 0,
        coutIntrants: editingEntry?.coutIntrants ?? 0,
        intrants: editingEntry?.intrants ?? "",
      })
    }
  }, [open, cultures, editingEntry])

  const surfaceHa = watch("surfaceHa")
  const recolteQty = watch("recolteQty")
  const rendementPreview = surfaceHa > 0 ? Math.round((recolteQty || 0) / surfaceHa) : 0

  async function handleFormSubmit(values: FormValues) {
    await onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingEntry ? t("production.agriculture.dialogTitleEdit") : t("production.agriculture.dialogTitleNew")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="date">{t("production.common.date")}</Label>
            <input id="date" type="date" {...register("date")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
          </div>

          <div>
            <Label htmlFor="culture">{t("production.agriculture.fieldCulture")}</Label>
            <Controller
              name="culture" control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="culture" className="mt-1.5">
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cultures.map((c) => (
                      <SelectItem key={c.id} value={c.nom}>{c.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.culture && <p className="mt-1 text-xs text-destructive">{errors.culture.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="surfaceHa">{t("production.agriculture.fieldSurface")}</Label>
              <input id="surfaceHa" type="number" step="0.1" {...register("surfaceHa", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              {errors.surfaceHa && <p className="mt-1 text-xs text-destructive">{errors.surfaceHa.message}</p>}
            </div>
            <div>
              <Label htmlFor="recolteQty">{t("production.agriculture.fieldHarvest")}</Label>
              <input id="recolteQty" type="number" {...register("recolteQty", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              {errors.recolteQty && <p className="mt-1 text-xs text-destructive">{errors.recolteQty.message}</p>}
            </div>
          </div>

          <div>
            <Label>{t("production.agriculture.yieldPreviewLabel")}</Label>
            <input readOnly value={`${rendementPreview} kg/ha`} className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground outline-none" />
          </div>

          <div>
            <Label htmlFor="coutIntrants">{t("production.agriculture.fieldCost")}</Label>
            <input id="coutIntrants" type="number" {...register("coutIntrants", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            {errors.coutIntrants && <p className="mt-1 text-xs text-destructive">{errors.coutIntrants.message}</p>}
          </div>

          <div>
            <Label htmlFor="intrants">{t("production.agriculture.fieldInputs")}</Label>
            <input id="intrants" {...register("intrants")} placeholder={t("production.agriculture.fieldInputsPlaceholder")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            {errors.intrants && <p className="mt-1 text-xs text-destructive">{errors.intrants.message}</p>}
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