import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const schema = z.object({
  nom: z.string().min(1, "Nom requis (ex: C5)"),
  capaciteMax: z.number({ invalid_type_error: "Nombre requis" }).positive("Doit être positif"),
})
type FormValues = z.infer<typeof schema>

interface AddCageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (nom: string, capaciteMax: number) => void
}

export function AddCageDialog({ open, onOpenChange, onSubmit }: AddCageDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  function handleFormSubmit(values: FormValues) {
    onSubmit(values.nom, values.capaciteMax)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une cage</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="nom">Nom de la cage</Label>
            <input
              id="nom"
              {...register("nom")}
              placeholder="Ex: C5"
              autoFocus
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.nom && <p className="mt-1 text-xs text-destructive">{errors.nom.message}</p>}
          </div>
          <div>
            <Label htmlFor="capaciteMax">Capacité max</Label>
            <input
              id="capaciteMax"
              type="number"
              {...register("capaciteMax", { valueAsNumber: true })}
              placeholder="5"
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.capaciteMax && <p className="mt-1 text-xs text-destructive">{errors.capaciteMax.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Ajouter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}