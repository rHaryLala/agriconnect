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
import type { PoulardMouvement, PoulardMouvementType } from "@/types/production"
import type { Client } from "@/types/client"

function buildSchema(t: (key: string) => string) {
  return z
    .object({
      date: z.string().min(1, t("stock.movements.validationDate")),
      type: z.enum(["entree", "vente", "mortalite"]),
      quantite: z.number({ error: t("stock.inventory.validationNumber") }).positive(t("stock.movements.validationQuantity")),
      clientId: z.string().optional(),
      prixUnitaire: z.number().min(0).optional(),
      observation: z.string(),
    })
    .refine((v) => v.type !== "vente" || !!v.clientId, {
      message: t("clients.invoices.validationClient"),
      path: ["clientId"],
    })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

interface PoulardMovementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: Client[]
  onSubmit: (data: Omit<PoulardMouvement, "id">) => Promise<void>
}

export function PoulardMovementDialog({ open, onOpenChange, clients, onSubmit }: PoulardMovementDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const {
    register, handleSubmit, control, watch, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) reset({ date: new Date().toISOString().slice(0, 10), type: "entree", quantite: 0, clientId: clients[0]?.id ?? "", prixUnitaire: 0, observation: "" })
  }, [open, clients, reset])

  const type = watch("type")

  async function handleFormSubmit(values: FormValues) {
    await onSubmit({
      date: values.date,
      type: values.type as PoulardMouvementType,
      quantite: values.quantite,
      clientId: values.type === "vente" ? values.clientId : undefined,
      prixUnitaire: values.type === "vente" ? values.prixUnitaire : undefined,
      observation: values.observation,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("production.poulard.dialogTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="type">{t("production.poulard.fieldType")}</Label>
            <Controller
              name="type" control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" className="mt-1.5">
                    <SelectValue>{(v: string) => t(`production.poulard.type${v === "vente" ? "Vente" : v === "mortalite" ? "Mortalite" : "Entree"}`)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entree">{t("production.poulard.typeEntree")}</SelectItem>
                    <SelectItem value="vente">{t("production.poulard.typeVente")}</SelectItem>
                    <SelectItem value="mortalite">{t("production.poulard.typeMortalite")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">{t("production.poulard.fieldDate")}</Label>
              <input id="date" type="date" {...register("date")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <Label htmlFor="quantite">{t("production.poulard.fieldQuantite")}</Label>
              <input id="quantite" type="number" {...register("quantite", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              {errors.quantite && <p className="mt-1 text-xs text-destructive">{errors.quantite.message}</p>}
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
              <div>
                <Label htmlFor="prixUnitaire">{t("production.poulard.fieldPrixUnitaire")}</Label>
                <input id="prixUnitaire" type="number" {...register("prixUnitaire", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
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
