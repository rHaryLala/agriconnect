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
import type { CategoryProfile } from "./categoriesStore"
import type { FinanceTransaction, TransactionType } from "@/types/finance"

function buildSchema(t: (key: string) => string) {
  return z.object({
    type: z.enum(["depense", "recette"], { errorMap: () => ({ message: t("finance.transactions.validationType") }) }),
    categorie: z.string().min(1, t("finance.transactions.validationCategory")),
    montant: z.number({ invalid_type_error: t("finance.transactions.validationNumber") }).positive(t("finance.transactions.validationAmount")),
    date: z.string().min(1, t("finance.transactions.validationDate")),
    description: z.string().min(1, t("finance.transactions.validationDescription")),
  })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  depenseCategories: CategoryProfile[]
  recetteCategories: CategoryProfile[]
  editingEntry?: FinanceTransaction | null
  onSubmit: (values: Omit<FinanceTransaction, "id">) => Promise<void>
}

export function TransactionDialog({ open, onOpenChange, depenseCategories, recetteCategories, editingEntry, onSubmit }: TransactionDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const {
    register, handleSubmit, control, watch, setValue, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) {
      reset({
        type: editingEntry?.type ?? "depense",
        categorie: editingEntry?.categorie ?? depenseCategories[0]?.nom ?? "",
        montant: editingEntry?.montant ?? 0,
        date: editingEntry?.date ?? new Date().toISOString().slice(0, 10),
        description: editingEntry?.description ?? "",
      })
    }
  }, [open, editingEntry])

  const type: TransactionType = watch("type")
  const categoryOptions = type === "recette" ? recetteCategories : depenseCategories

  useEffect(() => {
    const currentCategorie = watch("categorie")
    const stillValid = categoryOptions.some((c) => c.nom === currentCategorie)
    if (!stillValid) setValue("categorie", categoryOptions[0]?.nom ?? "")
  }, [type])

  async function handleFormSubmit(values: FormValues) {
    await onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingEntry ? t("finance.transactions.dialogTitleEdit") : t("finance.transactions.dialogTitleNew")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="type">{t("finance.transactions.fieldType")}</Label>
            <Controller
              name="type" control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" className="mt-1.5">
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="depense">{t("finance.transactions.typeExpense")}</SelectItem>
                    <SelectItem value="recette">{t("finance.transactions.typeRevenue")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <Label htmlFor="categorie">{t("finance.transactions.fieldCategory")}</Label>
            <Controller
              name="categorie" control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="categorie" className="mt-1.5">
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((c) => (
                      <SelectItem key={c.id} value={c.nom}>{c.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categorie && <p className="mt-1 text-xs text-destructive">{errors.categorie.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="montant">{t("finance.transactions.fieldAmount")}</Label>
              <input id="montant" type="number" {...register("montant", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              {errors.montant && <p className="mt-1 text-xs text-destructive">{errors.montant.message}</p>}
            </div>
            <div>
              <Label htmlFor="date">{t("finance.transactions.fieldDate")}</Label>
              <input id="date" type="date" {...register("date")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description">{t("finance.transactions.fieldDescription")}</Label>
            <textarea id="description" rows={2} {...register("description")} placeholder={t("finance.transactions.fieldDescriptionPlaceholder")} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
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