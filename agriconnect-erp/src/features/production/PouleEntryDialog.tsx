import { useEffect, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { EGG_CATEGORIES, type PouleEntry } from "@/types/production"
import { totalPoules as computeTotalPoules } from "@/lib/eggCalc"
import type { CageProfile } from "./cagesStore"

function buildSchema(t: (key: string) => string) {
  return z
    .object({
      date: z.string().min(1, t("stock.movements.validationDate")),
      cages: z.array(z.object({ cageId: z.string(), nom: z.string(), nbPoules: z.number({error: t("stock.inventory.validationNumber") }).min(0) })),
      gmNormal: z.number({error: t("stock.inventory.validationNumber") }).min(0),
      gmCasse: z.number({error: t("stock.inventory.validationNumber") }).min(0),
      pmNormal: z.number({error: t("stock.inventory.validationNumber") }).min(0),
      pmCasse: z.number({error: t("stock.inventory.validationNumber") }).min(0),
      alimentsKg: z.number({error: t("stock.inventory.validationNumber") }).min(0),
      mortalite: z.number({error: t("stock.inventory.validationNumber") }).min(0),
      observation: z.string().min(1, t("production.vaches.validationObservation")),
    })
    .superRefine((data, ctx) => {
      const totalPoulesCount = data.cages.reduce((sum, c) => sum + c.nbPoules, 0)
      const totalOeufs = data.gmNormal + data.gmCasse + data.pmNormal + data.pmCasse
      if (totalOeufs > totalPoulesCount) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("production.poules.validationEggsExceedHens"), path: ["gmNormal"] })
      }
      if (data.mortalite > totalPoulesCount) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("production.poules.validationMortalityExceedHens"), path: ["mortalite"] })
      }
    })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

interface PouleEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cages: CageProfile[]
  editingEntry?: PouleEntry | null
  onSubmit: (values: Omit<PouleEntry, "id">) => Promise<void>
}

export function PouleEntryDialog({ open, onOpenChange, cages, editingEntry, onSubmit }: PouleEntryDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const {
    register, handleSubmit, control, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const { fields } = useFieldArray({ control, name: "cages" })

  useEffect(() => {
    if (open) {
      reset({
        date: editingEntry?.date ?? new Date().toISOString().slice(0, 10),
        cages: cages.map((c) => {
          const existing = editingEntry?.cages.find((cg) => cg.cageId === c.id)
          return { cageId: c.id, nom: c.nom, nbPoules: existing?.nbPoules ?? 0 }
        }),
        gmNormal: editingEntry?.production.gmNormal ?? 0,
        gmCasse: editingEntry?.production.gmCasse ?? 0,
        pmNormal: editingEntry?.production.pmNormal ?? 0,
        pmCasse: editingEntry?.production.pmCasse ?? 0,
        alimentsKg: editingEntry?.alimentsKg ?? 0,
        mortalite: editingEntry?.mortalite ?? 0,
        observation: editingEntry?.observation ?? "",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cages, editingEntry])

  async function handleFormSubmit(values: FormValues) {
    await onSubmit({
      date: values.date,
      cages: values.cages.map((c) => ({ cageId: c.cageId, nbPoules: c.nbPoules })),
      production: { gmNormal: values.gmNormal, gmCasse: values.gmCasse, pmNormal: values.pmNormal, pmCasse: values.pmCasse },
      alimentsKg: values.alimentsKg,
      mortalite: values.mortalite,
      observation: values.observation,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingEntry ? t("production.poules.dialogTitleEdit") : t("production.poules.dialogTitleNew")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="date">{t("production.common.date")}</Label>
            <input id="date" type="date" {...register("date")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
          </div>

          <div>
            <Label>{t("production.poules.fieldCagesState")}</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-2 rounded-lg border border-border p-3 sm:grid-cols-3">
              {fields.length === 0 && <p className="col-span-full text-xs text-muted-foreground">{t("production.poules.noCagesMessage")}</p>}
              {fields.map((field, index) => (
                <div key={field.id}>
                  <span className="mb-1 block text-xs font-medium text-muted-foreground">{field.nom}</span>
                  <input type="number" {...register(`cages.${index}.nbPoules`, { valueAsNumber: true })} className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>{t("production.poules.statEggsTotal")}</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-3 rounded-lg border border-border p-3">
              <div>
                <span className="mb-1 block text-xs text-muted-foreground">{t("production.poules.eggCategories.gmNormal")}</span>
                <input type="number" {...register("gmNormal", { valueAsNumber: true })} className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <span className="mb-1 block text-xs text-muted-foreground">{t("production.poules.eggCategories.gmCasse")}</span>
                <input type="number" {...register("gmCasse", { valueAsNumber: true })} className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <span className="mb-1 block text-xs text-muted-foreground">{t("production.poules.eggCategories.pmNormal")}</span>
                <input type="number" {...register("pmNormal", { valueAsNumber: true })} className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <span className="mb-1 block text-xs text-muted-foreground">{t("production.poules.eggCategories.pmCasse")}</span>
                <input type="number" {...register("pmCasse", { valueAsNumber: true })} className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            {errors.gmNormal && <p className="mt-1 text-xs text-destructive">{errors.gmNormal.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="alimentsKg">{t("production.poules.fieldFeed")}</Label>
              <input id="alimentsKg" type="number" {...register("alimentsKg", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              {errors.alimentsKg && <p className="mt-1 text-xs text-destructive">{errors.alimentsKg.message}</p>}
            </div>
            <div>
              <Label htmlFor="mortalite">{t("production.poules.fieldMortality")}</Label>
              <input id="mortalite" type="number" {...register("mortalite", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              {errors.mortalite && <p className="mt-1 text-xs text-destructive">{errors.mortalite.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="observation">{t("production.common.observation")}</Label>
            <textarea id="observation" rows={2} {...register("observation")} placeholder={t("production.common.observationPlaceholder")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            {errors.observation && <p className="mt-1 text-xs text-destructive">{errors.observation.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={isSubmitting || fields.length === 0} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}