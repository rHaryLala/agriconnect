import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { VacheProfile } from "./vachesStore"
import type { VacheEntry } from "@/types/production"

const schema = z.object({
  date: z.string().min(1, "Date requise"),
  traites: z.array(
    z.object({
      vacheId: z.string(),
      nom: z.string(),
      matin: z.number({ invalid_type_error: "Nombre requis" }).min(0),
      soir: z.number({ invalid_type_error: "Nombre requis" }).min(0),
    })
  ),
  alimentationKg: z.number({ invalid_type_error: "Nombre requis" }).min(0),
  suiviSanitaire: z.string().min(1, "Renseigne une observation, même 'RAS'"),
})
type FormValues = z.infer<typeof schema>

interface VacheEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vaches: VacheProfile[]
  editingEntry?: VacheEntry | null 
  onSubmit: (values: Omit<VacheEntry, "id">) => Promise<void>
}

export function VacheEntryDialog({ open, onOpenChange, vaches, editingEntry, onSubmit }: VacheEntryDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const { fields } = useFieldArray({ control, name: "traites" })

  useEffect(() => {
    if (open) {
      reset({
        date: editingEntry?.date ?? new Date().toISOString().slice(0, 10),
        traites: vaches.map((v) => {
          const existing = editingEntry?.traites.find((t) => t.vacheId === v.id)
          return { vacheId: v.id, nom: v.nom, matin: existing?.matin ?? 0, soir: existing?.soir ?? 0 }
        }),
        alimentationKg: editingEntry?.alimentationKg ?? 0,
        suiviSanitaire: editingEntry?.suiviSanitaire ?? "",
      })
    }
  }, [open, vaches, editingEntry])

  async function handleFormSubmit(values: FormValues) {
    await onSubmit({
      date: values.date,
      traites: values.traites.map((t) => ({ vacheId: t.vacheId, matin: t.matin, soir: t.soir })),
      alimentationKg: values.alimentationKg,
      suiviSanitaire: values.suiviSanitaire,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingEntry ? "Modifier le relevé — Vaches laitières" : "Nouveau relevé — Vaches laitières"}</DialogTitle>
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
            <Label>Traite par vache</Label>
            <div className="mt-1.5 flex flex-col gap-2 rounded-lg border border-border p-3">
              {fields.length === 0 && (
                <p className="text-xs text-muted-foreground">Aucune vache enregistrée — ajoute-en une avant de saisir un relevé.</p>
              )}
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{field.nom}</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Matin (L)"
                    {...register(`traites.${index}.matin`, { valueAsNumber: true })}
                    className="w-24 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Soir (L)"
                    {...register(`traites.${index}.soir`, { valueAsNumber: true })}
                    className="w-24 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="alimentationKg">Alimentation (kg)</Label>
            <input
              id="alimentationKg"
              type="number"
              step="0.1"
              {...register("alimentationKg", { valueAsNumber: true })}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.alimentationKg && <p className="mt-1 text-xs text-destructive">{errors.alimentationKg.message}</p>}
          </div>

          <div>
            <Label htmlFor="suiviSanitaire">Observation / suivi sanitaire</Label>
            <textarea
              id="suiviSanitaire"
              rows={2}
              {...register("suiviSanitaire")}
              placeholder="RAS, ou observation"
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.suiviSanitaire && <p className="mt-1 text-xs text-destructive">{errors.suiviSanitaire.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || fields.length === 0} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingEntry ? "Enregistrer" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}