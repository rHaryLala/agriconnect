import { useEffect, useMemo, useState } from "react"
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
import { EGG_LOCATIONS, LOCATION_TO_CLIENT_ID, type EggLocation } from "@/types/eggLocation"
import { computeLocationStock } from "@/lib/eggLocationCalc"
import { useEggPricesStore } from "./eggPricesStore"
import { formatNumber } from "@/lib/format"
import type { PouleEntry } from "@/types/production"
import type { EggTransfer } from "@/types/eggLocation"
import type { Client } from "@/types/client"

type DestinationType = "interne" | "externe"

function buildSchema(t: (key: string) => string) {
  return z
    .object({
      date: z.string().min(1, t("stock.movements.validationDate")),
      from: z.enum(["ferme", "magasinier", "store"]),
      destinationType: z.enum(["interne", "externe"]),
      internalLocation: z.enum(["magasinier", "store"]).optional(),
      externalClientId: z.string().optional(),
      gmNormal: z.number({error: t("stock.inventory.validationNumber") }).min(0),
      gmCasse: z.number({error: t("stock.inventory.validationNumber") }).min(0),
      pmNormal: z.number({error: t("stock.inventory.validationNumber") }).min(0),
      pmCasse: z.number({error: t("stock.inventory.validationNumber") }).min(0),
      responsable: z.string().min(1, t("production.circuit.validationResponsible")),
      montantInitial: z.number().min(0),
      observation: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.destinationType === "interne" && (!data.internalLocation || data.internalLocation === data.from)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("production.circuit.validationSameLocation"), path: ["internalLocation"] })
      }
      if (data.destinationType === "externe" && !data.externalClientId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("clients.invoices.validationClient"), path: ["externalClientId"] })
      }
    })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

interface EggSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pouleEntries: PouleEntry[]
  transfers: EggTransfer[]
  clients: Client[]
  onSubmit: (transfer: Omit<EggTransfer, "id">, invoiceClientId: string, montantInitial: number) => Promise<void>
}

export function EggSaleDialog({ open, onOpenChange, pouleEntries, transfers, clients, onSubmit }: EggSaleDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])
  const prices = useEggPricesStore((s) => s.prices)
  const [destType, setDestType] = useState<DestinationType>("interne")

  const {
    register, handleSubmit, control, watch, setValue, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const externalClients = clients.filter((c) => c.type !== "magasinier" && c.type !== "store")

  useEffect(() => {
    if (open) {
      setDestType("interne")
      reset({
        date: new Date().toISOString().slice(0, 10),
        from: "ferme",
        destinationType: "interne",
        internalLocation: "magasinier",
        externalClientId: externalClients[0]?.id ?? "",
        gmNormal: 0, gmCasse: 0, pmNormal: 0, pmCasse: 0,
        responsable: "",
        montantInitial: 0,
        observation: "",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const from: EggLocation = watch("from")
  const sourceStock = useMemo(() => computeLocationStock(from, pouleEntries, transfers), [from, pouleEntries, transfers])

  const quantities = watch(["gmNormal", "gmCasse", "pmNormal", "pmCasse"])
  const total = EGG_CATEGORIES.reduce((sum, cat, i) => sum + (quantities[i] || 0) * prices[cat], 0)

  async function handleFormSubmit(values: FormValues) {
    const q: Record<EggCategory, number> = { gmNormal: values.gmNormal, gmCasse: values.gmCasse, pmNormal: values.pmNormal, pmCasse: values.pmCasse }

    for (const cat of EGG_CATEGORIES) {
      if (q[cat] > sourceStock[cat]) {
        alert(t("production.circuit.insufficientStock", { location: t(`production.circuit.location${from.charAt(0).toUpperCase() + from.slice(1)}`), category: t(`production.poules.eggCategories.${cat}`), available: formatNumber(sourceStock[cat]), requested: formatNumber(q[cat]) }))
        return
      }
    }

    const to = values.destinationType === "interne" ? (values.internalLocation as EggLocation) : "externe"
    const clientId = values.destinationType === "interne" ? LOCATION_TO_CLIENT_ID[values.internalLocation as EggLocation]! : values.externalClientId!

    await onSubmit(
      { date: values.date, from: values.from, to, quantities: q, responsable: values.responsable, observation: values.observation },
      clientId,
      values.montantInitial
    )
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
              <Label htmlFor="date">{t("production.circuit.fieldDate")}</Label>
              <input id="date" type="date" {...register("date")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          <div>
            <Label>{t("production.circuit.fieldDestinationType")}</Label>
            <div className="mt-1.5 flex gap-1 rounded-lg border border-border bg-surface p-1">
              {(["interne", "externe"] as const).map((d) => (
                <button
                  key={d} type="button"
                  onClick={() => { setDestType(d); setValue("destinationType", d) }}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm transition-colors duration-200 ${destType === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {d === "interne" ? t("production.circuit.destinationInternal") : t("production.circuit.destinationExternal")}
                </button>
              ))}
            </div>
          </div>

          {destType === "interne" ? (
            <div>
              <Label htmlFor="internalLocation">{t("production.circuit.fieldInternalLocation")}</Label>
              <Controller
                name="internalLocation" control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="internalLocation" className="mt-1.5">
                      <SelectValue placeholder="..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="magasinier">{t("production.circuit.locationMagasinier")}</SelectItem>
                      <SelectItem value="store">{t("production.circuit.locationStore")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.internalLocation && <p className="mt-1 text-xs text-destructive">{errors.internalLocation.message}</p>}
            </div>
          ) : (
            <div>
              <Label htmlFor="externalClientId">{t("production.circuit.fieldExternalClient")}</Label>
              <Controller
                name="externalClientId" control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="externalClientId" className="mt-1.5">
                      <SelectValue placeholder="..." />
                    </SelectTrigger>
                    <SelectContent>
                      {externalClients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.externalClientId && <p className="mt-1 text-xs text-destructive">{errors.externalClientId.message}</p>}
            </div>
          )}

          <div>
            <Label>{t("production.circuit.colQuantity")}</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-3 rounded-lg border border-border p-3">
              {EGG_CATEGORIES.map((cat) => (
                <div key={cat}>
                  <span className="mb-1 block text-xs text-muted-foreground">
                    {t(`production.poules.eggCategories.${cat}`)} <span className="text-muted-foreground/70">({formatNumber(sourceStock[cat])} dispo)</span>
                  </span>
                  <input type="number" {...register(cat, { valueAsNumber: true })} className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2.5">
            <span className="text-sm font-medium text-foreground">{t("clients.invoices.totalLabel")}</span>
            <span className="text-lg font-bold tabular-nums text-primary">{total.toLocaleString("fr-MG")} Ar</span>
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