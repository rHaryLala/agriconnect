import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { CultureTypeProfile } from "./cultureTypesStore"
import type { CultureEntry } from "@/types/production"

const schema = z.object({
  date: z.string().min(1, "Date requise"),
  culture: z.string().min(1, "Sélectionne une culture"),
  surfaceHa: z.number({ invalid_type_error: "Nombre requis" }).positive("Doit être positif"),
  recolteQty: z.number({ invalid_type_error: "Nombre requis" }).min(0),
  coutIntrants: z.number({ invalid_type_error: "Nombre requis" }).min(0),
  intrants: z.string().min(1, "Renseigne les intrants utilisés, même 'aucun'"),
})
type FormValues = z.infer<typeof schema>

interface AgricultureEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cultures: CultureTypeProfile[]
  onSubmit: (values: Omit<CultureEntry, "id">) => Promise<void>
}

export function AgricultureEntryDialog({ open, onOpenChange, cultures, onSubmit }: AgricultureEntryDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) {
      reset({ date: new Date().toISOString().slice(0, 10), culture: cultures[0]?.nom ?? "", surfaceHa: 0, recolteQty: 0, coutIntrants: 0, intrants: "" })
    }
  }, [open, cultures])
  
  const surfaceHa = watch("surfaceHa")
  const recolteQty = watch("recolteQty")
  const rendementPreview = surfaceHa > 0 ? Math.round((recolteQty || 0) / surfaceHa) : 0

  async function handleFormSubmit(values: FormValues) {
    await onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle entrée — Agriculture</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <input
              id="date"
              type="date"
              {...register("date")}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
          </div>

          <div>
            <Label htmlFor="culture">Culture</Label>
            <Controller
              name="culture"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="culture" className="mt-1.5">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cultures.map((c) => (
                      <SelectItem key={c.id} value={c.nom}>
                        {c.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.culture && <p className="mt-1 text-xs text-destructive">{errors.culture.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="surfaceHa">Surface (ha)</Label>
              <input
                id="surfaceHa"
                type="number"
                step="0.1"
                {...register("surfaceHa", { valueAsNumber: true })}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {errors.surfaceHa && <p className="mt-1 text-xs text-destructive">{errors.surfaceHa.message}</p>}
            </div>
            <div>
              <Label htmlFor="recolteQty">Récolte (kg)</Label>
              <input
                id="recolteQty"
                type="number"
                {...register("recolteQty", { valueAsNumber: true })}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {errors.recolteQty && <p className="mt-1 text-xs text-destructive">{errors.recolteQty.message}</p>}
            </div>
          </div>

          <div>
            <Label>Rendement (aperçu)</Label>
            {/* readonly : jamais modifiable à la main, purement informatif pendant la saisie */}
            <input
              readOnly
              value={`${rendementPreview} kg/ha`}
              className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground outline-none"
            />
          </div>

          <div>
            <Label htmlFor="coutIntrants">Coût des intrants (Ar)</Label>
            <input
              id="coutIntrants"
              type="number"
              {...register("coutIntrants", { valueAsNumber: true })}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.coutIntrants && <p className="mt-1 text-xs text-destructive">{errors.coutIntrants.message}</p>}
          </div>

          <div>
            <Label htmlFor="intrants">Intrants utilisés</Label>
            <input
              id="intrants"
              {...register("intrants")}
              placeholder="Engrais NPK, semences..."
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.intrants && <p className="mt-1 text-xs text-destructive">{errors.intrants.message}</p>}
          </div>

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