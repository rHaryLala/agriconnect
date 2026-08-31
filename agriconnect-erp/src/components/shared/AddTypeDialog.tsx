import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface AddTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  fieldLabel: string
  placeholder?: string
  onSubmit: (label: string) => void
}

export function AddTypeDialog({ open, onOpenChange, title, fieldLabel, placeholder, onSubmit }: AddTypeDialogProps) {
  const { t } = useTranslation()
  const schema = z.object({ label: z.string().min(2, t("stock.inventory.validationName")) })
  type FormValues = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  function handleFormSubmit(values: FormValues) {
    onSubmit(values.label)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="label">{fieldLabel}</Label>
            <input
              id="label"
              {...register("label")}
              placeholder={placeholder}
              aria-invalid={!!errors.label}
              autoFocus
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.label && <p className="mt-1 text-xs text-destructive">{errors.label.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("common.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}