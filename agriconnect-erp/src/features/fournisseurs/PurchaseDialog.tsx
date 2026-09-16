import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { currentIsoDate } from "@/lib/dateRange"
import type { AchatFournisseur } from "@/types/fournisseur"

const INPUT_CLASS =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"

function buildSchema(t: (key: string) => string) {
  return z
    .object({
      reference: z.string().min(1, t("fournisseurs.validationName")),
      date: z.string().min(1, t("stock.movements.validationDate")),
      description: z.string().min(2, t("fournisseurs.validationContact")),
      montant: z.number({ error: t("stock.inventory.validationNumber") }).positive(t("stock.inventory.validationNumber")),
      montantPaye: z.number({ error: t("stock.inventory.validationNumber") }).min(0, t("stock.inventory.validationNumber")),
    })
    .superRefine((data, ctx) => {
      if (data.montantPaye > data.montant) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("stock.inventory.validationNumber"), path: ["montantPaye"] })
      }
    })
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>

type SubmitPurchase = (values: Omit<AchatFournisseur, "id" | "fournisseurId">) => Promise<void>

interface PurchaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nextReference: string
  onSubmit: SubmitPurchase
}

interface PurchaseFormProps {
  nextReference: string
  onSubmit: SubmitPurchase
  onCancel: () => void
}

function PurchaseForm({ nextReference, onSubmit, onCancel }: PurchaseFormProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reference: nextReference, date: currentIsoDate(), description: "", montant: 0, montantPaye: 0 },
  })

  async function handleFormSubmit(values: FormValues) {
    try {
      await onSubmit(values)
      onCancel()
    } catch {
      toast.error(t("common.saveError"))
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="reference">{t("fournisseurs.fieldPurchaseReference")}</Label>
          <input id="reference" {...register("reference")} className={INPUT_CLASS} />
          {errors.reference && <p className="mt-1 text-xs text-destructive">{errors.reference.message}</p>}
        </div>
        <div>
          <Label htmlFor="date">{t("fournisseurs.purchaseDate")}</Label>
          <input id="date" type="date" {...register("date")} className={INPUT_CLASS} />
          {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="description">{t("fournisseurs.fieldPurchaseDescription")}</Label>
        <input id="description" {...register("description")} className={INPUT_CLASS} />
        {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="montant">{t("fournisseurs.fieldPurchaseAmount")}</Label>
          <input id="montant" type="number" min="0" {...register("montant", { valueAsNumber: true })} className={INPUT_CLASS} />
          {errors.montant && <p className="mt-1 text-xs text-destructive">{errors.montant.message}</p>}
        </div>
        <div>
          <Label htmlFor="montantPaye">{t("fournisseurs.fieldPurchasePaid")}</Label>
          <input id="montantPaye" type="number" min="0" {...register("montantPaye", { valueAsNumber: true })} className={INPUT_CLASS} />
          {errors.montantPaye && <p className="mt-1 text-xs text-destructive">{errors.montantPaye.message}</p>}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>{t("common.cancel")}</Button>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("common.save")}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function PurchaseDialog({ open, onOpenChange, nextReference, onSubmit }: PurchaseDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("fournisseurs.purchaseDialogTitle")}</DialogTitle>
        </DialogHeader>

        {open && <PurchaseForm nextReference={nextReference} onSubmit={onSubmit} onCancel={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}
