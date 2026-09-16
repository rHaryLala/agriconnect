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
import type { Client } from "@/types/client"
import type { Employe } from "@/types/personnel"

const NO_CLIENT = "aucun"

function buildSchema(t: (key: string) => string) {
  return z.object({
    nom: z.string().min(2, t("personnel.validationName")),
    fonction: z.string().min(2, t("personnel.validationRole")),
    departement: z.string().min(2, t("personnel.validationDepartment")),
    telephone: z.string().optional(),
    matriculeUaz: z.string().optional(),
    clientId: z.string().optional(),
    statut: z.enum(["actif", "inactif"]),
  })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

const INPUT_CLASS =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"

interface EmployeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingEmploye: Employe | null
  clients: Client[]
  onSubmit: (values: Omit<Employe, "id">) => Promise<void>
}

export function EmployeFormDialog({ open, onOpenChange, editingEmploye, clients, onSubmit }: EmployeFormDialogProps) {
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
        nom: editingEmploye?.nom ?? "",
        fonction: editingEmploye?.fonction ?? "",
        departement: editingEmploye?.departement ?? "",
        telephone: editingEmploye?.telephone ?? "",
        matriculeUaz: editingEmploye?.matriculeUaz ?? "",
        clientId: editingEmploye?.clientId ?? NO_CLIENT,
        statut: editingEmploye?.statut ?? "actif",
      })
    }
  }, [open, editingEmploye, reset])

  async function handleFormSubmit(values: FormValues) {
    await onSubmit({
      nom: values.nom,
      fonction: values.fonction,
      departement: values.departement,
      telephone: values.telephone || undefined,
      matriculeUaz: values.matriculeUaz || undefined,
      clientId: values.clientId && values.clientId !== NO_CLIENT ? values.clientId : undefined,
      statut: values.statut,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingEmploye ? t("personnel.dialogTitleEdit") : t("personnel.dialogTitleNew")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="nom">{t("personnel.fieldName")}</Label>
            <input id="nom" {...register("nom")} placeholder={t("personnel.fieldNamePlaceholder")} className={INPUT_CLASS} />
            {errors.nom && <p className="mt-1 text-xs text-destructive">{errors.nom.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="fonction">{t("personnel.fieldRole")}</Label>
              <input id="fonction" {...register("fonction")} placeholder={t("personnel.fieldRolePlaceholder")} className={INPUT_CLASS} />
              {errors.fonction && <p className="mt-1 text-xs text-destructive">{errors.fonction.message}</p>}
            </div>
            <div>
              <Label htmlFor="departement">{t("personnel.fieldDepartment")}</Label>
              <input id="departement" {...register("departement")} placeholder={t("personnel.fieldDepartmentPlaceholder")} className={INPUT_CLASS} />
              {errors.departement && <p className="mt-1 text-xs text-destructive">{errors.departement.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="telephone">{t("personnel.fieldPhone")}</Label>
              <input id="telephone" {...register("telephone")} placeholder="034 12 345 67" className={INPUT_CLASS} />
            </div>
            <div>
              <Label htmlFor="matriculeUaz">{t("personnel.fieldMatricule")}</Label>
              <input id="matriculeUaz" {...register("matriculeUaz")} placeholder="UAZ-0231" className={INPUT_CLASS} />
            </div>
          </div>

          <div>
            <Label htmlFor="statut">{t("personnel.fieldStatus")}</Label>
            <Controller
              name="statut"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="statut" className="mt-1.5">
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">{t("personnel.statusActive")}</SelectItem>
                    <SelectItem value="inactif">{t("personnel.statusInactive")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <Label htmlFor="clientId">{t("personnel.fieldClient")}</Label>
            <Controller
              name="clientId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="clientId" className="mt-1.5">
                    <SelectValue placeholder="...">
                      {(v: string) => (v === NO_CLIENT ? t("personnel.noClient") : (clients.find((c) => c.id === v)?.nom ?? "..."))}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_CLIENT}>{t("personnel.noClient")}</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="mt-1 text-xs text-muted-foreground">{t("personnel.fieldClientHint")}</p>
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
