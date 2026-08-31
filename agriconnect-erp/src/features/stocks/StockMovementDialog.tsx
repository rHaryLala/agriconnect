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
import type { StockArticle, StockMovement, MovementType } from "@/types/stock"

function buildSchema(t: (key: string) => string) {
  return z
    .object({
      articleId: z.string().min(1, t("stock.movements.validationArticle")),
      type: z.enum(["entree", "sortie"], { errorMap: () => ({ message: t("stock.movements.validationType") }) }),
      date: z.string().min(1, t("stock.movements.validationDate")),
      quantite: z.number({ invalid_type_error: t("stock.inventory.validationNumber") }).positive(t("stock.movements.validationQuantity")),
      destinataire: z.string().optional(),
      numeroBon: z.string().optional(),
      montant: z.number().optional(),
      observation: z.string().min(1, t("stock.movements.validationObservation")),
    })
    .superRefine((data, ctx) => {
      if (data.type === "sortie") {
        if (!data.destinataire?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("stock.movements.validationRecipient"), path: ["destinataire"] })
        if (!data.numeroBon?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("stock.movements.validationInvoiceNumber"), path: ["numeroBon"] })
        if (data.montant === undefined || data.montant < 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("stock.movements.validationAmount"), path: ["montant"] })
      }
    })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

interface StockMovementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  articles: StockArticle[]
  editingEntry?: StockMovement | null
  onSubmit: (values: Omit<StockMovement, "id">) => Promise<void>
}

export function StockMovementDialog({ open, onOpenChange, articles, editingEntry, onSubmit }: StockMovementDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) {
      reset({
        articleId: editingEntry?.articleId ?? articles[0]?.id ?? "",
        type: editingEntry?.type ?? ("entree" as MovementType),
        date: editingEntry?.date ?? new Date().toISOString().slice(0, 10),
        quantite: editingEntry?.quantite ?? 0,
        destinataire: editingEntry?.destinataire ?? "",
        numeroBon: editingEntry?.numeroBon ?? "",
        montant: editingEntry?.montant ?? 0,
        observation: editingEntry?.observation ?? "",
      })
    }
  }, [open, articles, editingEntry])

  const type = watch("type")

  async function handleFormSubmit(values: FormValues) {
    await onSubmit({
      articleId: values.articleId,
      type: values.type,
      date: values.date,
      quantite: values.quantite,
      observation: values.observation,
      ...(values.type === "sortie" ? { destinataire: values.destinataire, numeroBon: values.numeroBon, montant: values.montant } : {}),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingEntry ? t("stock.movements.dialogTitleEdit") : t("stock.movements.dialogTitleNew")}</DialogTitle>
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

          <div>
            <Label htmlFor="type">{t("stock.movements.fieldType")}</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" className="mt-1.5">
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entree">{t("stock.movements.typeEntry")}</SelectItem>
                    <SelectItem value="sortie">{t("stock.movements.typeExit")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="mt-1 text-xs text-destructive">{errors.type.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">{t("stock.movements.fieldDate")}</Label>
              <input id="date" type="date" {...register("date")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
            </div>
            <div>
              <Label htmlFor="quantite">{t("stock.movements.fieldQuantity")}</Label>
              <input id="quantite" type="number" {...register("quantite", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              {errors.quantite && <p className="mt-1 text-xs text-destructive">{errors.quantite.message}</p>}
            </div>
          </div>

          {type === "sortie" && (
            <div className="animate-content-in flex flex-col gap-4 rounded-lg border border-border bg-background p-3">
              <p className="text-xs font-medium text-muted-foreground">{t("stock.movements.sectionExitOnly")}</p>
              <div>
                <Label htmlFor="destinataire">{t("stock.movements.fieldRecipient")}</Label>
                <input id="destinataire" {...register("destinataire")} placeholder={t("stock.movements.fieldRecipientPlaceholder")} className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                {errors.destinataire && <p className="mt-1 text-xs text-destructive">{errors.destinataire.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="numeroBon">{t("stock.movements.fieldInvoiceNumber")}</Label>
                  <input id="numeroBon" {...register("numeroBon")} placeholder="CR-14502" className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  {errors.numeroBon && <p className="mt-1 text-xs text-destructive">{errors.numeroBon.message}</p>}
                </div>
                <div>
                  <Label htmlFor="montant">{t("stock.movements.fieldAmount")}</Label>
                  <input id="montant" type="number" {...register("montant", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  {errors.montant && <p className="mt-1 text-xs text-destructive">{errors.montant.message}</p>}
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="observation">{t("stock.movements.fieldObservation")}</Label>
            <textarea id="observation" rows={2} {...register("observation")} placeholder={t("stock.movements.fieldObservationPlaceholder")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
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