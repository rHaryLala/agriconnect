import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { CageProfile } from "./cagesStore"
import type { PouleEntry } from "@/types/production"

const schema = z
  .object({
    date: z.string().min(1, "Date requise"),
    cages: z.array(
      z.object({
        cageId: z.string(),
        nom: z.string(),
        nbPoules: z.number({ invalid_type_error: "Nombre requis" }).min(0),
      })
    ),
    oeufsProduits: z.number({ invalid_type_error: "Nombre requis" }).min(0),
    oeufsCasses: z.number({ invalid_type_error: "Nombre requis" }).min(0),
    alimentsKg: z.number({ invalid_type_error: "Nombre requis" }).min(0),
    mortalite: z.number({ invalid_type_error: "Nombre requis" }).min(0),
    observation: z.string().min(1, "Renseigne une observation, même 'RAS'"),
  })
  .superRefine((data, ctx) => {
    const totalPoules = data.cages.reduce((sum, c) => sum + c.nbPoules, 0)
    if (data.oeufsProduits > totalPoules) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ne peut pas dépasser le total de poules (max 1 œuf/poule/jour)", path: ["oeufsProduits"] })
    }
    if (data.mortalite > totalPoules) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ne peut pas dépasser le total de poules", path: ["mortalite"] })
    }
  })
type FormValues = z.infer<typeof schema>

interface PouleEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cages: CageProfile[]
  editingEntry?: PouleEntry | null
  onSubmit: (values: Omit<PouleEntry, "id">) => Promise<void>
}

export function PouleEntryDialog({ open, onOpenChange, cages, editingEntry, onSubmit }: PouleEntryDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const { fields } = useFieldArray({ control, name: "cages" })

  useEffect(() => {
    if (open) {
      reset({
        date: editingEntry?.date ?? new Date().toISOString().slice(0, 10),
        cages: cages.map((c) => {
          const existing = editingEntry?.cages.find((cg) => cg.cageId === c.id)
          return { cageId: c.id, nom: c.nom, nbPoules: existing?.nbPoules ?? 0 }
        }),
        oeufsProduits: editingEntry?.oeufsProduits ?? 0,
        oeufsCasses: editingEntry?.oeufsCasses ?? 0,
        alimentsKg: editingEntry?.alimentsKg ?? 0,
        mortalite: editingEntry?.mortalite ?? 0,
        observation: editingEntry?.observation ?? "",
      })
    }
  }, [open, cages, editingEntry])

  async function handleFormSubmit(values: FormValues) {
    await onSubmit({
      date: values.date,
      cages: values.cages.map((c) => ({ cageId: c.cageId, nbPoules: c.nbPoules })),
      oeufsProduits: values.oeufsProduits,
      oeufsCasses: values.oeufsCasses,
      alimentsKg: values.alimentsKg,
      mortalite: values.mortalite,
      observation: values.observation,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingEntry ? "Modifier le relevé — Poules pondeuses" : "Nouveau relevé — Poules pondeuses"}</DialogTitle>
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
            <Label>État des cages</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-2 rounded-lg border border-border p-3 sm:grid-cols-3">
              {fields.length === 0 && (
                <p className="col-span-full text-xs text-muted-foreground">
                  Aucune cage enregistrée — ajoute-en une avec "Ajouter une cage" avant de saisir un relevé.
                </p>
              )}
              {fields.map((field, index) => (
                <div key={field.id}>
                  <span className="mb-1 block text-xs font-medium text-muted-foreground">{field.nom}</span>
                  <input
                    type="number"
                    {...register(`cages.${index}.nbPoules`, { valueAsNumber: true })}
                    className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="oeufsProduits">Œufs produits</Label>
              <input
                id="oeufsProduits"
                type="number"
                {...register("oeufsProduits", { valueAsNumber: true })}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {errors.oeufsProduits && <p className="mt-1 text-xs text-destructive">{errors.oeufsProduits.message}</p>}
            </div>
            <div>
              <Label htmlFor="oeufsCasses">Œufs cassés / impropres</Label>
              <input
                id="oeufsCasses"
                type="number"
                {...register("oeufsCasses", { valueAsNumber: true })}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {errors.oeufsCasses && <p className="mt-1 text-xs text-destructive">{errors.oeufsCasses.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="alimentsKg">Aliments (kg)</Label>
              <input
                id="alimentsKg"
                type="number"
                {...register("alimentsKg", { valueAsNumber: true })}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {errors.alimentsKg && <p className="mt-1 text-xs text-destructive">{errors.alimentsKg.message}</p>}
            </div>
            <div>
              <Label htmlFor="mortalite">Mortalité</Label>
              <input
                id="mortalite"
                type="number"
                {...register("mortalite", { valueAsNumber: true })}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {errors.mortalite && <p className="mt-1 text-xs text-destructive">{errors.mortalite.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="observation">Observation</Label>
            <textarea
              id="observation"
              rows={2}
              {...register("observation")}
              placeholder="RAS, ou observation"
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.observation && <p className="mt-1 text-xs text-destructive">{errors.observation.message}</p>}
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