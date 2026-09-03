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
import { EGG_CATEGORIES, type EggCategory } from "@/types/production"
import { EGG_LOCATIONS, type EggLocation, type EggTransfer } from "@/types/eggLocation"
import { computeLocationStock } from "@/lib/eggLocationCalc"
import { formatNumber } from "@/lib/format"
import type { PouleEntry } from "@/types/production"

function buildSchema(t: (key: string) => string) {
  return z
    .object({
      date: z.string().min(1, t("stock.movements.validationDate")),
      from: z.enum(["ferme", "magasinier", "store"]),
      to: z.enum(["ferme", "magasinier", "store"]),
      gmNormal: z.number({error: t("stock.inventory.validationNumber") }).min(0),
      gmCasse: z.number({error: t("stock.inventory.validationNumber") }).min(0),
      pmNormal: z.number({error: t("stock.inventory.validationNumber") }).min(0),
      pmCasse: z.number({error: t("stock.inventory.validationNumber") }).min(0),
      responsable: z.string().min(1, t("production.circuit.validationResponsible")),
      observation: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.from === data.to) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("production.circuit.validationSameLocation"), path: ["to"] })
      }
    })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

interface EggTransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pouleEntries: PouleEntry[]
  transfers: EggTransfer[]
  onSubmit: (values: Omit<EggTransfer, "id">) => Promise<void>
}

export function EggTransferDialog({ open, onOpenChange, pouleEntries, transfers, onSubmit }: EggTransferDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const {
    register, handleSubmit, control, watch, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) {
      reset({ date: new Date().toISOString().slice(0, 10), from: "ferme", to: "magasinier", gmNormal: 0, gmCasse: 0, pmNormal: 0, pmCasse: 0, responsable: "", observation: "" })
    }
  }, [open, reset])

  const from: EggLocation = watch("from")
  const sourceStock = useMemo(() => computeLocationStock(from, pouleEntries, transfers), [from, pouleEntries, transfers])

  async function handleFormSubmit(values: FormValues) {
    const quantities: Record<EggCategory, number> = { gmNormal: values.gmNormal, gmCasse: values.gmCasse, pmNormal: values.pmNormal, pmCasse: values.pmCasse }
    for (const cat of EGG_CATEGORIES) {
      if (quantities[cat] > sourceStock[cat]) {
        alert(
          t("production.circuit.insufficientStock", {
            location: t(`production.circuit.location${from.charAt(0).toUpperCase() + from.slice(1)}`),
            category: t(`production.poules.eggCategories.${cat}`),
            available: formatNumber(sourceStock[cat]),
            requested: formatNumber(quantities[cat]),
          })
        )
        return
      }
    }

    await onSubmit({ date: values.date, from: values.from, to: values.to, quantities, responsable: values.responsable, observation: values.observation })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("production.circuit.dialogTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="from">{t("production.circuit.fieldFrom")}</Label>
              <Controller
                name="from" control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="from" className="mt-1.5">
                      <SelectValue placeholder="..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EGG_LOCATIONS.map((loc) => (
                        <SelectItem key={loc} value={loc}>{t(`production.circuit.location${loc.charAt(0).toUpperCase() + loc.slice(1)}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="to">{t("production.circuit.fieldTo")}</Label>
              <Controller
                name="to" control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="to" className="mt-1.5">
                      <SelectValue placeholder="..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EGG_LOCATIONS.map((loc) => (
                        <SelectItem key={loc} value={loc}>{t(`production.circuit.location${loc.charAt(0).toUpperCase() + loc.slice(1)}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.to && <p className="mt-1 text-xs text-destructive">{errors.to.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="date">{t("production.circuit.fieldDate")}</Label>
            <input id="date" type="date" {...register("date")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>

          <div>
            <Label>{t("production.circuit.colQuantity")}</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-3 rounded-lg border border-border p-3">
              {EGG_CATEGORIES.map((cat) => (
                <div key={cat}>
                  <span className="mb-1 block text-xs text-muted-foreground">
                    {t(`production.poules.eggCategories.${cat}`)}
                    <span className="ml-1 text-muted-foreground/70">({formatNumber(sourceStock[cat])} {t("production.circuit.stockLabel").toLowerCase()})</span>
                  </span>
                  <input type="number" {...register(cat, { valueAsNumber: true })} className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="responsable">{t("production.circuit.fieldResponsible")}</Label>
            <input id="responsable" {...register("responsable")} placeholder={t("production.circuit.fieldResponsiblePlaceholder")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            {errors.responsable && <p className="mt-1 text-xs text-destructive">{errors.responsable.message}</p>}
          </div>

          <div>
            <Label htmlFor="observation">{t("production.circuit.fieldObservation")}</Label>
            <input id="observation" {...register("observation")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
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