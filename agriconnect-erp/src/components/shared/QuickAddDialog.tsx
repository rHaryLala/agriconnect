import { useForm, Controller, type FieldValues, type Path, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import type { ZodType } from "zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export type FieldConfig<T> =
  | { type: "number"; name: Path<T>; label: string; unit?: string; step?: string; placeholder?: string; required?: boolean }
  | { type: "date"; name: Path<T>; label: string; required?: boolean }
  | { type: "text"; name: Path<T>; label: string; placeholder?: string; required?: boolean }
  | { type: "select"; name: Path<T>; label: string; options: { value: string; label: string }[]; placeholder?: string; required?: boolean }

interface QuickAddDialogProps<T extends FieldValues> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  schema: ZodType<T, T>
  fields: FieldConfig<T>[]
  defaultValues: T
  onSubmit: (values: T) => Promise<void>
}

interface QuickAddFormProps<T extends FieldValues> {
  schema: ZodType<T, T>
  fields: FieldConfig<T>[]
  defaultValues: T
  onSubmit: (values: T) => Promise<void>
  onCancel: () => void
}

function inputTypeFor<T>(field: FieldConfig<T>) {
  if (field.type === "number") return "number"
  return field.type === "date" ? "date" : "text"
}

function QuickAddForm<T extends FieldValues>({ schema, fields, defaultValues, onSubmit, onCancel }: QuickAddFormProps<T>) {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<T>({
    resolver: zodResolver(schema) as unknown as Resolver<T>,
    defaultValues: defaultValues as never,
  })

  async function handleFormSubmit(values: T) {
    try {
      await onSubmit(values)
      onCancel()
    } catch {
      toast.error(t("common.saveError"))
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit as never)} className="flex flex-col gap-4">
      {fields.map((field) => {
        const fieldName = field.name as string
        const error = (errors as Record<string, { message?: string } | undefined>)[fieldName]

        return (
          <div key={fieldName}>
            <Label htmlFor={fieldName}>
              {field.label}
              {field.type === "number" && field.unit ? ` (${field.unit})` : ""}
              {field.required === false && (
                <span className="ml-1 text-xs font-normal text-muted-foreground">({t("common.optional")})</span>
              )}
            </Label>

            {field.type === "select" ? (
              <Controller
                name={field.name}
                control={control}
                render={({ field: ctrl }) => (
                  <Select value={ctrl.value} onValueChange={ctrl.onChange}>
                    <SelectTrigger id={fieldName} className="mt-1.5">
                      <SelectValue placeholder={field.placeholder ?? t("common.selectPlaceholder")} />
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
                type={inputTypeFor(field)}
                step={field.type === "number" ? field.step ?? "1" : undefined}
                placeholder={field.type === "number" || field.type === "text" ? field.placeholder : undefined}
                {...register(field.name, { valueAsNumber: field.type === "number" })}
                aria-invalid={!!error}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            )}
            {error?.message && <p className="mt-1 text-xs text-destructive">{error.message}</p>}
          </div>
        )
      })}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("common.save")}
        </Button>
      </DialogFooter>
    </form>
  )
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {open && (
          <QuickAddForm
            schema={schema}
            fields={fields}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
