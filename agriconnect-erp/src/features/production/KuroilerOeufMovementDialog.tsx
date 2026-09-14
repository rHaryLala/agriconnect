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
import { KUROILER_OEUF_MOUVEMENT_TYPES, type KuroilerOeufMouvement, type KuroilerOeufMouvementType, type ProductionPaymentMethod } from "@/types/production"
import { KUROILER_OEUF_TYPE_LABEL_KEYS } from "./kuroilerOeufLabels"
import type { Client } from "@/types/client"

const PAYMENT_METHODS: ProductionPaymentMethod[] = ["comptant", "commande", "salaire"]
const PAYMENT_LABEL_KEYS: Record<ProductionPaymentMethod, string> = {
  comptant: "clients.invoices.paymentComptant",
  commande: "clients.invoices.paymentCommande",
  salaire: "clients.invoices.paymentSalaire",
}

function buildSchema(t: (key: string) => string) {
  return z
    .object({
      date: z.string().min(1, t("stock.movements.validationDate")),
      type: z.enum(KUROILER_OEUF_MOUVEMENT_TYPES as [KuroilerOeufMouvementType, ...KuroilerOeufMouvementType[]]),
      quantite: z.number({ error: t("stock.inventory.validationNumber") }).positive(t("stock.movements.validationQuantity")),
      clientId: z.string().optional(),
      prixUnitaire: z.number().min(0).optional(),
      paymentMethod: z.enum(PAYMENT_METHODS as [ProductionPaymentMethod, ...ProductionPaymentMethod[]]).optional(),
      observation: z.string(),
    })
    .refine((v) => v.type !== "vente" || !!v.clientId, {
      message: t("clients.invoices.validationClient"),
      path: ["clientId"],
    })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

const INPUT_CLASS =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"

interface KuroilerOeufMovementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: Client[]
  onSubmit: (data: Omit<KuroilerOeufMouvement, "id">) => Promise<void>
}

export function KuroilerOeufMovementDialog({ open, onOpenChange, clients, onSubmit }: KuroilerOeufMovementDialogProps) {
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
        date: new Date().toISOString().slice(0, 10),
        type: "entree",
        quantite: 0,
        clientId: clients[0]?.id ?? "",
        prixUnitaire: 0,
        paymentMethod: "comptant",
        observation: "",
      })
    }
  }, [open, clients, reset])

  const type = useWatch({ control, name: "type" })

  async function handleFormSubmit(values: FormValues) {
    const isSale = values.type === "vente"
    await onSubmit({
      date: values.date,
      type: values.type,
      quantite: values.quantite,
      clientId: isSale ? values.clientId : undefined,
      prixUnitaire: isSale ? values.prixUnitaire : undefined,
      paymentMethod: isSale ? values.paymentMethod : undefined,
      observation: values.observation,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("production.kuroiler.eggs.dialogTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="type">{t("production.kuroiler.eggs.fieldType")}</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" className="mt-1.5">
                    <SelectValue>{(v: string) => t(KUROILER_OEUF_TYPE_LABEL_KEYS[v as KuroilerOeufMouvementType])}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {KUROILER_OEUF_MOUVEMENT_TYPES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {t(KUROILER_OEUF_TYPE_LABEL_KEYS[value])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">{t("production.common.date")}</Label>
              <input id="date" type="date" {...register("date")} className={INPUT_CLASS} />
              {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
            </div>
            <div>
              <Label htmlFor="quantite">{t("production.kuroiler.eggs.fieldQuantity")}</Label>
              <input id="quantite" type="number" {...register("quantite", { valueAsNumber: true })} className={INPUT_CLASS} />
              {errors.quantite && <p className="mt-1 text-xs text-destructive">{errors.quantite.message}</p>}
            </div>
          </div>

          {type === "vente" && (
            <div className="animate-content-in flex flex-col gap-4 rounded-lg border border-border bg-background p-3">
              <div>
                <Label htmlFor="clientId">{t("production.circuit.fieldExternalClient")}</Label>
                <Controller
                  name="clientId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="clientId" className="mt-1.5">
                        <SelectValue placeholder="...">{(v: string) => clients.find((c) => c.id === v)?.nom ?? "..."}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.clientId && <p className="mt-1 text-xs text-destructive">{errors.clientId.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="prixUnitaire">{t("production.riz.fieldPrixUnitaire")}</Label>
                  <input id="prixUnitaire" type="number" {...register("prixUnitaire", { valueAsNumber: true })} className={INPUT_CLASS} />
                </div>
                <div>
                  <Label htmlFor="paymentMethod">{t("production.riz.fieldPaymentMethod")}</Label>
                  <Controller
                    name="paymentMethod"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="paymentMethod" className="mt-1.5">
                          <SelectValue placeholder="..." />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map((method) => (
                            <SelectItem key={method} value={method}>
                              {t(PAYMENT_LABEL_KEYS[method])}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>
          )}

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
