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
import type { BovinAnimal, BovinSortieType } from "@/types/production"
import type { Client } from "@/types/client"

function buildSchema(t: (key: string) => string) {
  return z
    .object({
      dateSortie: z.string().min(1, t("stock.movements.validationDate")),
      typeSortie: z.enum(["vente", "deces"]),
      clientId: z.string().optional(),
      prixVente: z.number().min(0).optional(),
      signataire: z.string().min(1, t("production.bovins.validationSignataire")),
      observation: z.string(),
    })
    .refine((v) => v.typeSortie !== "vente" || !!v.clientId, {
      message: t("clients.invoices.validationClient"),
      path: ["clientId"],
    })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

interface BovinSortieDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  animal: BovinAnimal | null
  clients: Client[]
  onSubmit: (id: string, data: { dateSortie: string; typeSortie: BovinSortieType; clientId?: string; prixVente?: number; signataire: string; observation: string }) => Promise<void>
}

export function BovinSortieDialog({ open, onOpenChange, animal, clients, onSubmit }: BovinSortieDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const {
    register, handleSubmit, control, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) reset({ dateSortie: new Date().toISOString().slice(0, 10), typeSortie: "vente", clientId: clients[0]?.id ?? "", prixVente: 0, signataire: "", observation: "" })
  }, [open, clients, reset])

  const typeSortie = useWatch({ control, name: "typeSortie" })

  async function handleFormSubmit(values: FormValues) {
    if (!animal) return
    await onSubmit(animal.id, {
      dateSortie: values.dateSortie,
      typeSortie: values.typeSortie,
      clientId: values.typeSortie === "vente" ? values.clientId : undefined,
      prixVente: values.typeSortie === "vente" ? values.prixVente : undefined,
      signataire: values.signataire,
      observation: values.observation,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("production.bovins.sortieDialogTitle", { identifiant: animal?.identifiant ?? "" })}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="typeSortie">{t("production.bovins.fieldTypeSortie")}</Label>
            <Controller
              name="typeSortie" control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="typeSortie" className="mt-1.5">
                    <SelectValue>{(v: string) => t(v === "deces" ? "production.bovins.typeSortieDeces" : "production.bovins.typeSortieVente")}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vente">{t("production.bovins.typeSortieVente")}</SelectItem>
                    <SelectItem value="deces">{t("production.bovins.typeSortieDeces")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {typeSortie === "vente" && (
            <>
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
                <Label htmlFor="prixVente">{t("production.bovins.fieldPrixVente")}</Label>
                <input id="prixVente" type="number" {...register("prixVente", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="dateSortie">{t("production.bovins.fieldDateSortie")}</Label>
            <input id="dateSortie" type="date" {...register("dateSortie")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>

          <div>
            <Label htmlFor="signataire">{t("production.bovins.fieldSignataire")}</Label>
            <input id="signataire" {...register("signataire")} placeholder={t("production.bovins.fieldSignatairePlaceholder")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            {errors.signataire && <p className="mt-1 text-xs text-destructive">{errors.signataire.message}</p>}
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
