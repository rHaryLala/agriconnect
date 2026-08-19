import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { StockArticle, StockMovement, MovementType } from "@/types/stock"

const schema = z
  .object({
    articleId: z.string().min(1, "Sélectionne un article"),
    type: z.enum(["entree", "sortie"], { errorMap: () => ({ message: "Sélectionne un type" }) }),
    date: z.string().min(1, "Date requise"),
    quantite: z.number({ invalid_type_error: "Nombre requis" }).positive("Doit être positif"),
    destinataire: z.string().optional(),
    numeroBon: z.string().optional(),
    montant: z.number().optional(),
    observation: z.string().min(1, "Renseigne une observation, même 'RAS'"),
  })
  .superRefine((data, ctx) => {
    if (data.type === "sortie") {
      if (!data.destinataire?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Destinataire requis pour une sortie", path: ["destinataire"] })
      if (!data.numeroBon?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "N° de bon requis pour une sortie", path: ["numeroBon"] })
      if (data.montant === undefined || data.montant < 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Montant requis pour une sortie", path: ["montant"] })
    }
  })
type FormValues = z.infer<typeof schema>

interface StockMovementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  articles: StockArticle[]
  onSubmit: (values: Omit<StockMovement, "id">) => Promise<void>
}

export function StockMovementDialog({ open, onOpenChange, articles, onSubmit }: StockMovementDialogProps) {
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
      reset({
        articleId: articles[0]?.id ?? "",
        type: "entree" as MovementType,
        date: new Date().toISOString().slice(0, 10),
        quantite: 0,
        destinataire: "",
        numeroBon: "",
        montant: 0,
        observation: "",
      })
    }
  }, [open, articles])

  const type = watch("type")

  async function handleFormSubmit(values: FormValues) {
    await onSubmit({
      articleId: values.articleId,
      type: values.type,
      date: values.date,
      quantite: values.quantite,
      observation: values.observation,
      ...(values.type === "sortie"
        ? { destinataire: values.destinataire, numeroBon: values.numeroBon, montant: values.montant }
        : {}),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau mouvement de stock</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="articleId">Article</Label>
            <Controller
              name="articleId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="articleId" className="mt-1.5">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {articles.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.nom} ({a.unite})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.articleId && <p className="mt-1 text-xs text-destructive">{errors.articleId.message}</p>}
          </div>

          <div>
            <Label htmlFor="type">Type de mouvement</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" className="mt-1.5">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entree">Entrée</SelectItem>
                    <SelectItem value="sortie">Sortie</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="mt-1 text-xs text-destructive">{errors.type.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <Label htmlFor="quantite">Quantité</Label>
              <input
                id="quantite"
                type="number"
                {...register("quantite", { valueAsNumber: true })}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {errors.quantite && <p className="mt-1 text-xs text-destructive">{errors.quantite.message}</p>}
            </div>
          </div>

          {type === "sortie" && (
            <div className="animate-content-in flex flex-col gap-4 rounded-lg border border-border bg-background p-3">
              <p className="text-xs font-medium text-muted-foreground">Informations de sortie</p>
              <div>
                <Label htmlFor="destinataire">Destinataire</Label>
                <input
                  id="destinataire"
                  {...register("destinataire")}
                  placeholder="Ex: Restaurant Chez Lala"
                  className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {errors.destinataire && <p className="mt-1 text-xs text-destructive">{errors.destinataire.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="numeroBon">N° Bon / Facture</Label>
                  <input
                    id="numeroBon"
                    {...register("numeroBon")}
                    placeholder="CR-14502"
                    className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.numeroBon && <p className="mt-1 text-xs text-destructive">{errors.numeroBon.message}</p>}
                </div>
                <div>
                  <Label htmlFor="montant">Montant perçu (Ar)</Label>
                  <input
                    id="montant"
                    type="number"
                    {...register("montant", { valueAsNumber: true })}
                    className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.montant && <p className="mt-1 text-xs text-destructive">{errors.montant.message}</p>}
                </div>
              </div>
            </div>
          )}

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