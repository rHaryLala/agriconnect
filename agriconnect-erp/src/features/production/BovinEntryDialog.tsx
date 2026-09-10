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
import type { BovinAnimal } from "@/types/production"

function buildSchema(t: (key: string) => string) {
  return z.object({
    identifiant: z.string().min(1, t("production.bovins.validationIdentifiant")),
    genre: z.enum(["male", "femelle"]),
    dateEntree: z.string().min(1, t("stock.movements.validationDate")),
    typeEntree: z.enum(["achat", "naissance"]),
    observation: z.string(),
  })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

interface BovinEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<BovinAnimal, "id" | "statut">) => Promise<void>
}

export function BovinEntryDialog({ open, onOpenChange, onSubmit }: BovinEntryDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const {
    register, handleSubmit, control, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) reset({ identifiant: "", genre: "femelle", dateEntree: new Date().toISOString().slice(0, 10), typeEntree: "achat", observation: "" })
  }, [open, reset])

  async function handleFormSubmit(values: FormValues) {
    await onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("production.bovins.entryDialogTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="identifiant">{t("production.bovins.fieldIdentifiant")}</Label>
            <input id="identifiant" {...register("identifiant")} placeholder={t("production.bovins.fieldIdentifiantPlaceholder")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            {errors.identifiant && <p className="mt-1 text-xs text-destructive">{errors.identifiant.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="genre">{t("production.bovins.fieldGenre")}</Label>
              <Controller
                name="genre" control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="genre" className="mt-1.5">
                      <SelectValue>{(v: string) => t(v === "male" ? "production.bovins.genreMale" : "production.bovins.genreFemelle")}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="femelle">{t("production.bovins.genreFemelle")}</SelectItem>
                      <SelectItem value="male">{t("production.bovins.genreMale")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="typeEntree">{t("production.bovins.fieldTypeEntree")}</Label>
              <Controller
                name="typeEntree" control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="typeEntree" className="mt-1.5">
                      <SelectValue>{(v: string) => t(v === "naissance" ? "production.bovins.typeEntreeNaissance" : "production.bovins.typeEntreeAchat")}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="achat">{t("production.bovins.typeEntreeAchat")}</SelectItem>
                      <SelectItem value="naissance">{t("production.bovins.typeEntreeNaissance")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dateEntree">{t("production.bovins.fieldDateEntree")}</Label>
            <input id="dateEntree" type="date" {...register("dateEntree")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
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
