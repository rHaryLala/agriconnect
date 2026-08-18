import { useEffect } from "react"
import { useForm, type FieldValues, type Path } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ZodType } from "zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Controller } from "react-hook-form"

export type FieldConfig<T> =
  | { type: "number"; name: Path<T>; label: string; unit?: string; step?: string }
  | { type: "date"; name: Path<T>; label: string }
  | { type: "text"; name: Path<T>; label: string; placeholder?: string }
  | { type: "select"; name: Path<T>; label: string; options: { value: string; label: string }[] }

interface QuickAddDialogProps<T extends FieldValues> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  schema: ZodType<T>
  fields: FieldConfig<T>[]
  defaultValues: T
  onSubmit: (values: T) => Promise<void>
}

export function QuickAddDialog<T extends FieldValues>({
  open,
  onOpenChange,
  title,
  schema,
  fields,
  defaultValues,
  onSubmit,
}: QuickAddDialogProps<T>) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<T>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) reset(defaultValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

 async function handleFormSubmit(values: T) {
    try {
      await onSubmit(values)
      onOpenChange(false)
    } catch {
      // Handle error if needed
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          {fields.map((field) => {
            const fieldName = field.name as string
            const error = (errors as Record<string, { message?: string } | undefined>)[fieldName]

            return (
              <div key={fieldName}>
                <Label htmlFor={fieldName}>
                  {field.label}
                  {field.type === "number" && field.unit ? ` (${field.unit})` : ""}
                </Label>

                {field.type === "select" ? (
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: ctrl }) => (
                      <Select value={ctrl.value} onValueChange={ctrl.onChange}>
                        <SelectTrigger id={fieldName} className="mt-1.5">
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : (
                  <input
                    id={fieldName}
                    type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                    step={field.type === "number" ? field.step ?? "1" : undefined}
                    placeholder={field.type === "text" ? field.placeholder : undefined}
                    {...register(field.name, {
                      valueAsNumber: field.type === "number",
                    })}
                    aria-invalid={!!error}
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                )}
                {error?.message && <p className="mt-1 text-xs text-destructive">{error.message}</p>}
              </div>
            )
          })}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}