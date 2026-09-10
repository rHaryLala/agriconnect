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
import { formatNumber } from "@/lib/format"
import type { HaricotMouvement, HaricotVariante, HaricotMouvementType, ProductionPaymentMethod } from "@/types/production"
import type { Client } from "@/types/client"

function buildSchema(t: (key: string) => string) {
  return z
    .object({
      date: z.string().min(1, t("stock.movements.validationDate")),
      variante: z.enum(["blanc", "rouge"]),
      type: z.enum(["entree", "vente"]),
      quantiteKg: z.number({ error: t("stock.inventory.validationNumber") }).positive(),
      clientId: z.string().optional(),
      prixUnitaire: z.number().min(0).optional(),
      paymentMethod: z.enum(["comptant", "commande", "salaire"]).optional(),
      observation: z.string(),
    })
    .refine((v) => v.type !== "vente" || !!v.clientId, {
      message: t("clients.invoices.validationClient"),
      path: ["clientId"],
    })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

interface HaricotMovementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: Client[]
  stockBlanc: number
  stockRouge: number
  onSubmit: (data: Omit<HaricotMouvement, "id">) => Promise<void>
}

export function HaricotMovementDialog({ open, onOpenChange, clients, stockBlanc, stockRouge, onSubmit }: HaricotMovementDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const {
    register, handleSubmit, control, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) reset({ date: new Date().toISOString().slice(0, 10), variante: "blanc", type: "entree", quantiteKg: 0, clientId: clients[0]?.id ?? "", prixUnitaire: 0, paymentMethod: "comptant", observation: "" })
  }, [open, clients, reset])

  const type = useWatch({ control, name: "type" })
  const variante = useWatch({ control, name: "variante" })
  const availableStock = variante === "rouge" ? stockRouge : stockBlanc

  async function handleFormSubmit(values: FormValues) {
    if (values.type === "vente" && values.quantiteKg > availableStock) {
      alert(t("production.haricots.insufficientStock", { available: formatNumber(availableStock), requested: formatNumber(values.quantiteKg) }))
      return
    }
    await onSubmit({
      date: values.date,
      variante: values.variante as HaricotVariante,
      type: values.type as HaricotMouvementType,
      quantiteKg: values.quantiteKg,
      clientId: values.type === "vente" ? values.clientId : undefined,
      prixUnitaire: values.type === "vente" ? values.prixUnitaire : undefined,
      paymentMethod: values.type === "vente" ? (values.paymentMethod as ProductionPaymentMethod) : undefined,
      observation: values.observation,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("production.haricots.dialogTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="variante">{t("production.haricots.fieldVariante")}</Label>
              <Controller
                name="variante" control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="variante" className="mt-1.5">
                      <SelectValue>{(v: string) => t(v === "rouge" ? "production.haricots.varianteRouge" : "production.haricots.varianteBlanc")}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blanc">{t("production.haricots.varianteBlanc")}</SelectItem>
                      <SelectItem value="rouge">{t("production.haricots.varianteRouge")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="type">{t("production.haricots.fieldType")}</Label>
              <Controller
                name="type" control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="type" className="mt-1.5">
                      <SelectValue>{(v: string) => t(v === "vente" ? "production.haricots.typeVente" : "production.haricots.typeEntree")}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entree">{t("production.haricots.typeEntree")}</SelectItem>
                      <SelectItem value="vente">{t("production.haricots.typeVente")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">{t("production.riz.fieldDate")}</Label>
              <input id="date" type="date" {...register("date")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <Label htmlFor="quantiteKg">{t("production.riz.fieldQuantiteKg")} {type === "vente" && <span className="text-muted-foreground/70">({t("production.riz.available", { value: formatNumber(availableStock) })})</span>}</Label>
              <input id="quantiteKg" type="number" {...register("quantiteKg", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              {errors.quantiteKg && <p className="mt-1 text-xs text-destructive">{errors.quantiteKg.message}</p>}
            </div>
          </div>

          {type === "vente" && (
            <div className="animate-content-in flex flex-col gap-4 rounded-lg border border-border bg-background p-3">
              <div>
                <Label htmlFor="clientId">{t("production.circuit.fieldExternalClient")}</Label>
                <Controller
                  name="clientId" control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="clientId" className="mt-1.5">
                        <SelectValue placeholder="...">{(v: string) => clients.find((c) => c.id === v)?.nom ?? "..."}</SelectValue>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="prixUnitaire">{t("production.riz.fieldPrixUnitaire")}</Label>
                  <input id="prixUnitaire" type="number" {...register("prixUnitaire", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <Label htmlFor="paymentMethod">{t("production.riz.fieldPaymentMethod")}</Label>
                  <Controller
                    name="paymentMethod" control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="paymentMethod" className="mt-1.5">
                          <SelectValue>{(v: string) => t(`clients.invoices.payment${v === "salaire" ? "Salaire" : v === "commande" ? "Commande" : "Comptant"}`)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comptant">{t("clients.invoices.paymentComptant")}</SelectItem>
                          <SelectItem value="commande">{t("clients.invoices.paymentCommande")}</SelectItem>
                          <SelectItem value="salaire">{t("clients.invoices.paymentSalaire")}</SelectItem>
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
