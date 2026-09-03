import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { EGG_CATEGORIES, type EggCategory } from "@/types/production"
import { useEggPricesStore } from "@/features/production/eggPricesStore"

interface EggPricesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EggPricesDialog({ open, onOpenChange }: EggPricesDialogProps) {
  const { t } = useTranslation()
  const { prices, setPrice } = useEggPricesStore()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("production.poules.managePricesTitle")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {EGG_CATEGORIES.map((cat: EggCategory) => (
            <div key={cat}>
              <Label htmlFor={`price-${cat}`}>{t("production.poules.priceLabel", { category: t(`production.poules.eggCategories.${cat}`) })}</Label>
              <input
                id={`price-${cat}`}
                type="number"
                value={prices[cat]}
                onChange={(e) => setPrice(cat, Number(e.target.value))}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}