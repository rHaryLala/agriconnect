import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/format"
import type { Invoice } from "@/types/invoice"
import { computeInvoiceDue } from "@/types/invoice"

interface RecordPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
  onSubmit: (id: string, amount: number) => Promise<void>
}

export function RecordPaymentDialog({ open, onOpenChange, invoice, onSubmit }: RecordPaymentDialogProps) {
  const { t } = useTranslation()
  const due = invoice ? computeInvoiceDue(invoice) : 0

  const schema = useMemo(
    () =>
      z.object({
        montant: z
          .number({ error: t("clients.invoices.validationPaymentAmount") })
          .positive(t("clients.invoices.validationPaymentAmount"))
          .max(due || Infinity, t("clients.invoices.validationPaymentExceedsDue", { amount: formatCurrency(due) })),
      }),
    [t, due]
  )
  type FormValues = z.infer<typeof schema>

  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) reset({ montant: due })
  }, [open, due, reset])

  async function handleFormSubmit(values: FormValues) {
    if (!invoice) return
    await onSubmit(invoice.id, values.montant)
    onOpenChange(false)
  }

  if (!invoice) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("clients.invoices.recordPaymentDialogTitle", { numero: invoice.numero })}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">{t("clients.invoices.remainingHint", { amount: formatCurrency(due) })}</p>

          <div>
            <Label htmlFor="montant">{t("clients.invoices.fieldPaymentAmount")}</Label>
            <input id="montant" type="number" {...register("montant", { valueAsNumber: true })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            {errors.montant && <p className="mt-1 text-xs text-destructive">{errors.montant.message}</p>}
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