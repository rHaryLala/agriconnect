import { useEffect, useMemo } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { Client } from "@/types/client"
import type { Invoice, PaymentMethod } from "@/types/invoice"
import type { StockArticle } from "@/types/stock"
import { formatCurrency } from "@/lib/format"
import { PAYMENT_METHOD_LABEL_KEYS } from "./invoiceLabels"

function buildSchema(t: (key: string) => string) {
  return z.object({
    clientId: z.string().min(1, t("clients.invoices.validationClient")),
    date: z.string().min(1, "Date requise"),
    paymentMethod: z.enum(["comptant", "commande", "salaire"], { error: () => t("clients.invoices.validationMethod") }),
    items: z
      .array(
        z.object({
          articleId: z.string().min(1, t("clients.invoices.validationArticle")),
          quantite: z.number({ error: t("clients.invoices.validationQuantity") }).positive(t("clients.invoices.validationQuantity")),
          prixUnitaire: z.number({ error: t("clients.invoices.validationPrice") }).min(0, t("clients.invoices.validationPrice")),
        })
      )
      .min(1, t("clients.invoices.validationItems")),
    montantInitial: z.number().min(0),
  })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

interface InvoiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: Client[]
  articles: StockArticle[]
  onSubmit: (values: Omit<Invoice, "id" | "numero">) => Promise<void>
}

export function InvoiceFormDialog({ open, onOpenChange, clients, articles, onSubmit }: InvoiceFormDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const {
    register, handleSubmit, control, watch, setValue, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const { fields, append, remove } = useFieldArray({ control, name: "items" })

  useEffect(() => {
    if (open) {
      reset({
        clientId: clients[0]?.id ?? "",
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: "comptant",
        items: [{ articleId: articles[0]?.id ?? "", quantite: 1, prixUnitaire: 0 }],
        montantInitial: 0,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, clients, articles])

  const items = watch("items")
  const paymentMethod: PaymentMethod = watch("paymentMethod")
  const total = items?.reduce((sum, it) => sum + (it.quantite || 0) * (it.prixUnitaire || 0), 0) ?? 0
  useEffect(() => {
    if (paymentMethod === "comptant") setValue("montantInitial", total)
    if (paymentMethod === "salaire") setValue("montantInitial", 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod, total])

  async function handleFormSubmit(values: FormValues) {
    await onSubmit({
      clientId: values.clientId,
      date: values.date,
      paymentMethod: values.paymentMethod,
      items: values.items,
      montantPaye: values.montantInitial,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("clients.invoices.dialogTitleNew")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="clientId">{t("clients.invoices.fieldClient")}</Label>
              <Controller
                name="clientId" control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="clientId" className="mt-1.5">
                      <SelectValue placeholder="..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.clientId && <p className="mt-1 text-xs text-destructive">{errors.clientId.message}</p>}
            </div>
            <div>
              <Label htmlFor="date">{t("clients.invoices.fieldDate")}</Label>
              <input id="date" type="date" {...register("date")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          <div>
            <Label htmlFor="paymentMethod">{t("clients.invoices.fieldMethod")}</Label>
            <Controller
              name="paymentMethod" control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="paymentMethod" className="mt-1.5">
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAYMENT_METHOD_LABEL_KEYS).map(([value, labelKey]) => (
                      <SelectItem key={value} value={value}>{t(labelKey)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {paymentMethod === "comptant" && <p className="mt-1.5 text-xs text-muted-foreground">{t("clients.invoices.comptantNote")}</p>}
            {paymentMethod === "salaire" && <p className="mt-1.5 text-xs text-muted-foreground">{t("clients.invoices.salaireNote")}</p>}
          </div>

          <div>
            <Label>{t("clients.invoices.fieldItems")}</Label>
            <div className="mt-1.5 flex flex-col gap-2 rounded-lg border border-border p-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_70px_100px_auto] items-end gap-2">
                  <Controller
                    name={`items.${index}.articleId`} control={control}
                    render={({ field: f }) => (
                      <Select value={f.value} onValueChange={f.onChange}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={t("clients.invoices.fieldArticle")} />
                        </SelectTrigger>
                        <SelectContent>
                          {articles.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.nom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <input type="number" placeholder={t("clients.invoices.fieldQuantity")} {...register(`items.${index}.quantite`, { valueAsNumber: true })} className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  <input type="number" placeholder={t("clients.invoices.fieldUnitPrice")} {...register(`items.${index}.prixUnitaire`, { valueAsNumber: true })} className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1} aria-label={t("clients.invoices.removeLine")}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {errors.items && <p className="text-xs text-destructive">{errors.items.message}</p>}

              <Button type="button" variant="outline" size="sm" onClick={() => append({ articleId: articles[0]?.id ?? "", quantite: 1, prixUnitaire: 0 })} className="mt-1 w-fit gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                {t("clients.invoices.addLine")}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2.5">
            <span className="text-sm font-medium text-foreground">{t("clients.invoices.totalLabel")}</span>
            <span className="text-lg font-bold tabular-nums text-primary">{formatCurrency(total)}</span>
          </div>

          {paymentMethod === "commande" && (
            <div className="animate-content-in">
              <Label htmlFor="montantInitial">{t("clients.invoices.fieldInitialPayment")}</Label>
              <input id="montantInitial" type="number" {...register("montantInitial", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
          )}

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