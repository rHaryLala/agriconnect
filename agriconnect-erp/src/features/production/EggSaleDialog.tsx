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
import { EGG_CATEGORIES, type EggCategory, type PouleEntry } from "@/types/production"
import { computeFermeStock } from "@/lib/eggCalc"
import { useEggPricesStore } from "./eggPricesStore"
import { formatNumber, formatCurrency } from "@/lib/format"
import type { EggSale } from "@/types/eggSale"
import type { Client } from "@/types/client"

function buildSchema(t: (key: string) => string) {
  return z.object({
    date: z.string().min(1, t("stock.movements.validationDate")),
    clientId: z.string().min(1, t("clients.invoices.validationClient")),
    gmNormal: z.number({ error: t("stock.inventory.validationNumber") }).min(0),
    gmCasse: z.number({ error: t("stock.inventory.validationNumber") }).min(0),
    pmNormal: z.number({ error: t("stock.inventory.validationNumber") }).min(0),
    pmCasse: z.number({ error: t("stock.inventory.validationNumber") }).min(0),
    responsable: z.string().min(1, t("production.circuit.validationResponsible")),
    montantInitial: z.number().min(0),
    observation: z.string().optional(),
  })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

interface EggSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pouleEntries: PouleEntry[]
  sales: EggSale[]
  clients: Client[]
  onSubmit: (sale: Omit<EggSale, "id">, montantInitial: number) => Promise<void>
}

export function EggSaleDialog({ open, onOpenChange, pouleEntries, sales, clients, onSubmit }: EggSaleDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])
  const prices = useEggPricesStore((s) => s.prices)

  const {
    register, handleSubmit, control, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const fermeStock = useMemo(() => computeFermeStock(pouleEntries, sales), [pouleEntries, sales])

  useEffect(() => {
    if (open) reset({ date: new Date().toISOString().slice(0, 10), clientId: clients[0]?.id ?? "", gmNormal: 0, gmCasse: 0, pmNormal: 0, pmCasse: 0, responsable: "", montantInitial: 0, observation: "" })
  }, [open, clients, reset])

  const quantities = useWatch({ control, name: ["gmNormal", "gmCasse", "pmNormal", "pmCasse"] })
  const total = EGG_CATEGORIES.reduce((sum, cat, i) => sum + (quantities[i] || 0) * prices[cat], 0)

  async function handleFormSubmit(values: FormValues) {
    const q: Record<EggCategory, number> = { gmNormal: values.gmNormal, gmCasse: values.gmCasse, pmNormal: values.pmNormal, pmCasse: values.pmCasse }
    for (const cat of EGG_CATEGORIES) {
      if (q[cat] > fermeStock[cat]) {
        alert(t("production.circuit.insufficientStock", { location: "Ferme", category: t(`production.poules.eggCategories.${cat}`), available: formatNumber(fermeStock[cat]), requested: formatNumber(q[cat]) }))
        return
      }
    }
    await onSubmit({ date: values.date, clientId: values.clientId, quantities: q, responsable: values.responsable, observation: values.observation }, values.montantInitial)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("production.circuit.saleDialogTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <Label htmlFor="date">{t("production.circuit.fieldDate")}</Label>
              <input id="date" type="date" {...register("date")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          <div>
            <Label>{t("production.circuit.colQuantity")}</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-3 rounded-lg border border-border p-3">
              {EGG_CATEGORIES.map((cat) => (
                <div key={cat}>
                  <span className="mb-1 block text-xs text-muted-foreground">
                    {t(`production.poules.eggCategories.${cat}`)} <span className="text-muted-foreground/70">({formatNumber(fermeStock[cat])} dispo)</span>
                  </span>
                  <input type="number" {...register(cat, { valueAsNumber: true })} className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2.5">
            <span className="text-sm font-medium text-foreground">{t("clients.invoices.totalLabel")}</span>
            <span className="text-lg font-bold tabular-nums text-primary">{formatCurrency(total)}</span>
          </div>

          <div>
            <Label htmlFor="montantInitial">{t("production.circuit.fieldPaymentInitial")}</Label>
            <input id="montantInitial" type="number" {...register("montantInitial", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>

          <div>
            <Label htmlFor="responsable">{t("production.circuit.fieldResponsible")}</Label>
            <input id="responsable" {...register("responsable")} placeholder={t("production.circuit.fieldResponsiblePlaceholder")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            {errors.responsable && <p className="mt-1 text-xs text-destructive">{errors.responsable.message}</p>}
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