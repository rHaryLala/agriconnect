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
import { formatNumber } from "@/lib/format"
import type { RizVente, ProductionPaymentMethod } from "@/types/production"
import type { Client } from "@/types/client"

function buildSchema(t: (key: string) => string) {
  return z.object({
    date: z.string().min(1, t("stock.movements.validationDate")),
    quantiteKg: z.number({ error: t("stock.inventory.validationNumber") }).positive(),
    clientId: z.string().min(1, t("clients.invoices.validationClient")),
    prixUnitaire: z.number().min(0),
    paymentMethod: z.enum(["comptant", "commande", "salaire"]),
    observation: z.string(),
  })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

interface RizVenteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: Client[]
  stockRizDecortique: number
  onSubmit: (data: Omit<RizVente, "id">) => Promise<void>
}

export function RizVenteDialog({ open, onOpenChange, clients, stockRizDecortique, onSubmit }: RizVenteDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const {
    register, handleSubmit, control, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) reset({ date: new Date().toISOString().slice(0, 10), quantiteKg: 0, clientId: clients[0]?.id ?? "", prixUnitaire: 0, paymentMethod: "comptant", observation: "" })
  }, [open, clients, reset])

  async function handleFormSubmit(values: FormValues) {
    if (values.quantiteKg > stockRizDecortique) {
      alert(t("production.riz.insufficientStockRiz", { available: formatNumber(stockRizDecortique), requested: formatNumber(values.quantiteKg) }))
      return
    }
    await onSubmit({ ...values, paymentMethod: values.paymentMethod as ProductionPaymentMethod })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("production.riz.venteDialogTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
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
              <Label htmlFor="date">{t("production.riz.fieldDate")}</Label>
              <input id="date" type="date" {...register("date")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <Label htmlFor="quantiteKg">{t("production.riz.fieldQuantiteKg")} <span className="text-muted-foreground/70">({t("production.riz.available", { value: formatNumber(stockRizDecortique) })})</span></Label>
              <input id="quantiteKg" type="number" {...register("quantiteKg", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              {errors.quantiteKg && <p className="mt-1 text-xs text-destructive">{errors.quantiteKg.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="prixUnitaire">{t("production.riz.fieldPrixUnitaire")}</Label>
            <input id="prixUnitaire" type="number" {...register("prixUnitaire", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
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
