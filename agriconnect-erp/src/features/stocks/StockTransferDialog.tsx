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
import { STOCK_LOCATIONS, DEFAULT_STOCK_LOCATION, type StockArticle, type StockMovement, type StockLocation } from "@/types/stock"
import { STOCK_LOCATION_LABEL_KEYS } from "./stockLabels"

function buildSchema(t: (key: string) => string) {
  const location = z.enum(STOCK_LOCATIONS as [StockLocation, ...StockLocation[]], { error: t("stock.movements.validationLocation") })
  return z
    .object({
      articleId: z.string().min(1, t("stock.movements.validationArticle")),
      emplacement: location,
      emplacementDestination: location,
      date: z.string().min(1, t("stock.movements.validationDate")),
      quantite: z.number({ error: t("stock.inventory.validationNumber") }).positive(t("stock.movements.validationQuantity")),
      montant: z.number({ error: t("stock.inventory.validationNumber") }).min(0),
      responsable: z.string().min(1, t("stock.transfers.validationResponsible")),
      observation: z.string().min(1, t("stock.movements.validationObservation")),
    })
    .superRefine((data, ctx) => {
      if (data.emplacement === data.emplacementDestination) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("stock.transfers.validationSameLocation"), path: ["emplacementDestination"] })
      }
    })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

const INPUT_CLASS =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"

interface StockTransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  articles: StockArticle[]
  editingEntry?: StockMovement | null
  onSubmit: (values: Omit<StockMovement, "id">) => Promise<void>
}

export function StockTransferDialog({ open, onOpenChange, articles, editingEntry, onSubmit }: StockTransferDialogProps) {
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
        articleId: editingEntry?.articleId ?? articles[0]?.id ?? "",
        emplacement: editingEntry?.emplacement ?? DEFAULT_STOCK_LOCATION,
        emplacementDestination: editingEntry?.emplacementDestination ?? "magasinier",
        date: editingEntry?.date ?? new Date().toISOString().slice(0, 10),
        quantite: editingEntry?.quantite ?? 0,
        montant: editingEntry?.montant ?? 0,
        responsable: editingEntry?.responsable ?? "",
        observation: editingEntry?.observation ?? "",
      })
    }
  }, [open, articles, editingEntry, reset])

  async function handleFormSubmit(values: FormValues) {
    await onSubmit({
      articleId: values.articleId,
      type: "transfert",
      emplacement: values.emplacement,
      emplacementDestination: values.emplacementDestination,
      date: values.date,
      quantite: values.quantite,
      montant: values.montant,
      montantRegle: editingEntry?.montantRegle ?? 0,
      responsable: values.responsable,
      observation: values.observation,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingEntry ? t("stock.transfers.dialogTitleEdit") : t("stock.transfers.dialogTitleNew")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="articleId">{t("stock.movements.fieldArticle")}</Label>
            <Controller
              name="articleId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="articleId" className="mt-1.5">
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                  <SelectContent>
                    {articles.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.nom} ({a.unite})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.articleId && <p className="mt-1 text-xs text-destructive">{errors.articleId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(["emplacement", "emplacementDestination"] as const).map((name) => (
              <div key={name}>
                <Label htmlFor={name}>{name === "emplacement" ? t("stock.transfers.fieldFrom") : t("stock.transfers.fieldTo")}</Label>
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={name} className="mt-1.5">
                        <SelectValue placeholder="..." />
                      </SelectTrigger>
                      <SelectContent>
                        {STOCK_LOCATIONS.map((location) => (
                          <SelectItem key={location} value={location}>
                            {t(STOCK_LOCATION_LABEL_KEYS[location])}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors[name] && <p className="mt-1 text-xs text-destructive">{errors[name]?.message}</p>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">{t("stock.movements.fieldDate")}</Label>
              <input id="date" type="date" {...register("date")} className={INPUT_CLASS} />
              {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
            </div>
            <div>
              <Label htmlFor="quantite">{t("stock.movements.fieldQuantity")}</Label>
              <input id="quantite" type="number" {...register("quantite", { valueAsNumber: true })} className={INPUT_CLASS} />
              {errors.quantite && <p className="mt-1 text-xs text-destructive">{errors.quantite.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="montant">{t("stock.transfers.fieldValue")}</Label>
              <input id="montant" type="number" {...register("montant", { valueAsNumber: true })} className={INPUT_CLASS} />
              <p className="mt-1 text-xs text-muted-foreground">{t("stock.transfers.valueHint")}</p>
              {errors.montant && <p className="mt-1 text-xs text-destructive">{errors.montant.message}</p>}
            </div>
            <div>
              <Label htmlFor="responsable">{t("stock.transfers.fieldResponsible")}</Label>
              <input id="responsable" {...register("responsable")} placeholder={t("stock.transfers.fieldResponsiblePlaceholder")} className={INPUT_CLASS} />
              {errors.responsable && <p className="mt-1 text-xs text-destructive">{errors.responsable.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="observation">{t("stock.movements.fieldObservation")}</Label>
            <textarea id="observation" rows={2} {...register("observation")} placeholder={t("stock.movements.fieldObservationPlaceholder")} className={INPUT_CLASS} />
            {errors.observation && <p className="mt-1 text-xs text-destructive">{errors.observation.message}</p>}
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
