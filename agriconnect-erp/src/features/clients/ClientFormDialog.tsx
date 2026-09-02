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
import { CLIENT_TYPE_LABEL_KEYS } from "./clientLabels"
import type { Client, ClientType } from "@/types/client"

function buildSchema(t: (key: string) => string) {
  return z.object({
    nom: z.string().min(2, t("clients.validationName")),
    type: z.enum(["cafeteria", "store", "personnel", "externe"]).describe(t("clients.validationType")),
    telephone: z.string().optional(),
    matriculeUaz: z.string().optional(),
  })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

interface ClientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingClient: Client | null
  onSubmit: (values: Omit<Client, "id">) => Promise<void>
}

export function ClientFormDialog({ open, onOpenChange, editingClient, onSubmit }: ClientFormDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const {
    register, handleSubmit, control, watch, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) {
      reset(
        editingClient
          ? { nom: editingClient.nom, type: editingClient.type, telephone: editingClient.telephone ?? "", matriculeUaz: editingClient.matriculeUaz ?? "" }
          : { nom: "", type: "externe", telephone: "", matriculeUaz: "" }
      )
    }
  }, [open, editingClient, reset])
  const type: ClientType = watch("type")

  async function handleFormSubmit(values: FormValues) {
    await onSubmit({
      nom: values.nom,
      type: values.type,
      telephone: values.telephone || undefined,
      matriculeUaz: values.type === "personnel" ? values.matriculeUaz || undefined : undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingClient ? t("clients.dialogTitleEdit") : t("clients.dialogTitleNew")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="nom">{t("clients.fieldName")}</Label>
            <input
              id="nom" {...register("nom")} aria-invalid={!!errors.nom}
              placeholder={t("clients.fieldNamePlaceholder")}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.nom && <p className="mt-1 text-xs text-destructive">{errors.nom.message}</p>}
          </div>

          <div>
            <Label htmlFor="type">{t("clients.fieldType")}</Label>
            <Controller
              name="type" control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" className="mt-1.5">
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CLIENT_TYPE_LABEL_KEYS).map(([value, labelKey]) => (
                      <SelectItem key={value} value={value}>{t(labelKey)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="mt-1 text-xs text-destructive">{errors.type.message}</p>}
          </div>

          <div>
            <Label htmlFor="telephone">{t("clients.fieldPhone")}</Label>
            <input
              id="telephone" {...register("telephone")} placeholder={t("clients.fieldPhonePlaceholder")}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {type === "personnel" && (
            <div className="animate-content-in">
              <Label htmlFor="matriculeUaz">{t("clients.fieldMatricule")}</Label>
              <input
                id="matriculeUaz" {...register("matriculeUaz")} placeholder={t("clients.fieldMatriculePlaceholder")}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
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