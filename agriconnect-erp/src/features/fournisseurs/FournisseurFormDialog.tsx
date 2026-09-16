import { useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CATEGORIE_LABEL_KEYS } from "./fournisseurLabels"
import {
  FOURNISSEUR_CATEGORIES,
  FOURNISSEUR_STATUTS,
  type Fournisseur,
  type FournisseurCategorie,
  type FournisseurStatut,
} from "@/types/fournisseur"

const INPUT_CLASS =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"

function buildSchema(t: (key: string) => string) {
  return z.object({
    nom: z.string().min(2, t("fournisseurs.validationName")),
    contact: z.string().min(2, t("fournisseurs.validationContact")),
    telephone: z.string().optional(),
    email: z.string().optional(),
    adresse: z.string().optional(),
    categorie: z.enum(FOURNISSEUR_CATEGORIES as [FournisseurCategorie, ...FournisseurCategorie[]]),
    produits: z.string().optional(),
    note: z.number({ error: t("fournisseurs.validationRating") }).min(0, t("fournisseurs.validationRating")).max(5, t("fournisseurs.validationRating")),
    delaiPaiementJours: z.number({ error: t("fournisseurs.validationDays") }).min(0, t("fournisseurs.validationDays")).max(180, t("fournisseurs.validationDays")),
    statut: z.enum(FOURNISSEUR_STATUTS as [FournisseurStatut, ...FournisseurStatut[]]),
  })
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>

type SubmitFournisseur = (values: Omit<Fournisseur, "id">) => Promise<void>

interface FournisseurFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingFournisseur: Fournisseur | null
  onSubmit: SubmitFournisseur
}

interface FournisseurFormProps {
  editingFournisseur: Fournisseur | null
  onSubmit: SubmitFournisseur
  onCancel: () => void
}

function defaultValuesFor(editing: Fournisseur | null): FormValues {
  if (!editing) {
    return {
      nom: "",
      contact: "",
      telephone: "",
      email: "",
      adresse: "",
      categorie: "aliments",
      produits: "",
      note: 4,
      delaiPaiementJours: 30,
      statut: "actif",
    }
  }
  return {
    nom: editing.nom,
    contact: editing.contact,
    telephone: editing.telephone ?? "",
    email: editing.email ?? "",
    adresse: editing.adresse ?? "",
    categorie: editing.categorie,
    produits: editing.produits.join(", "),
    note: editing.note,
    delaiPaiementJours: editing.delaiPaiementJours,
    statut: editing.statut,
  }
}

function FournisseurForm({ editingFournisseur, onSubmit, onCancel }: FournisseurFormProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const {
    register, handleSubmit, control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValuesFor(editingFournisseur),
  })

  async function handleFormSubmit(values: FormValues) {
    try {
      await onSubmit({
        nom: values.nom,
        contact: values.contact,
        telephone: values.telephone || undefined,
        email: values.email || undefined,
        adresse: values.adresse || undefined,
        categorie: values.categorie,
        produits: (values.produits ?? "")
          .split(",")
          .map((produit) => produit.trim())
          .filter(Boolean),
        note: values.note,
        delaiPaiementJours: values.delaiPaiementJours,
        statut: values.statut,
      })
      onCancel()
    } catch {
      toast.error(t("common.saveError"))
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="nom">{t("fournisseurs.fieldName")}</Label>
          <input id="nom" {...register("nom")} placeholder={t("fournisseurs.fieldNamePlaceholder")} className={INPUT_CLASS} />
          {errors.nom && <p className="mt-1 text-xs text-destructive">{errors.nom.message}</p>}
        </div>
        <div>
          <Label htmlFor="contact">{t("fournisseurs.fieldContact")}</Label>
          <input id="contact" {...register("contact")} placeholder={t("fournisseurs.fieldContactPlaceholder")} className={INPUT_CLASS} />
          {errors.contact && <p className="mt-1 text-xs text-destructive">{errors.contact.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="telephone">{t("fournisseurs.fieldPhone")}</Label>
          <input id="telephone" {...register("telephone")} placeholder="034 22 145 08" className={INPUT_CLASS} />
        </div>
        <div>
          <Label htmlFor="email">{t("fournisseurs.fieldEmail")}</Label>
          <input id="email" type="email" {...register("email")} placeholder="contact@exemple.mg" className={INPUT_CLASS} />
        </div>
      </div>

      <div>
        <Label htmlFor="adresse">{t("fournisseurs.fieldAddress")}</Label>
        <input id="adresse" {...register("adresse")} placeholder={t("fournisseurs.fieldAddressPlaceholder")} className={INPUT_CLASS} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="categorie">{t("fournisseurs.fieldCategory")}</Label>
          <Controller
            name="categorie" control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="categorie" className="mt-1.5">
                  <SelectValue>
                    {(value: FournisseurCategorie | null) => t(CATEGORIE_LABEL_KEYS[value ?? "aliments"])}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FOURNISSEUR_CATEGORIES.map((value) => (
                    <SelectItem key={value} value={value}>{t(CATEGORIE_LABEL_KEYS[value])}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label htmlFor="statut">{t("fournisseurs.fieldStatus")}</Label>
          <Controller
            name="statut" control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="statut" className="mt-1.5">
                  <SelectValue>
                    {(value: FournisseurStatut | null) =>
                      value === "inactif" ? t("fournisseurs.statusInactive") : t("fournisseurs.statusActive")
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">{t("fournisseurs.statusActive")}</SelectItem>
                  <SelectItem value="inactif">{t("fournisseurs.statusInactive")}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="produits">{t("fournisseurs.fieldProducts")}</Label>
        <input id="produits" {...register("produits")} placeholder={t("fournisseurs.fieldProductsPlaceholder")} className={INPUT_CLASS} />
        <p className="mt-1 text-xs text-muted-foreground">{t("fournisseurs.fieldProductsHint")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="note">{t("fournisseurs.fieldRating")}</Label>
          <input id="note" type="number" step="0.5" min="0" max="5" {...register("note", { valueAsNumber: true })} className={INPUT_CLASS} />
          {errors.note && <p className="mt-1 text-xs text-destructive">{errors.note.message}</p>}
        </div>
        <div>
          <Label htmlFor="delaiPaiementJours">{t("fournisseurs.fieldPaymentDays")}</Label>
          <input id="delaiPaiementJours" type="number" min="0" max="180" {...register("delaiPaiementJours", { valueAsNumber: true })} className={INPUT_CLASS} />
          {errors.delaiPaiementJours && <p className="mt-1 text-xs text-destructive">{errors.delaiPaiementJours.message}</p>}
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

export function FournisseurFormDialog({ open, onOpenChange, editingFournisseur, onSubmit }: FournisseurFormDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingFournisseur ? t("fournisseurs.dialogTitleEdit") : t("fournisseurs.dialogTitleNew")}
          </DialogTitle>
        </DialogHeader>

        {open && (
          <FournisseurForm
            key={editingFournisseur?.id ?? "new"}
            editingFournisseur={editingFournisseur}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
