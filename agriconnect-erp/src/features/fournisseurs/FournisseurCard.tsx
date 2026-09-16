import { Link } from "react-router"
import { useTranslation } from "react-i18next"
import { Phone, MapPin, User } from "lucide-react"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Rating } from "@/components/shared/Rating"
import { formatCurrency } from "@/lib/format"
import { CATEGORIE_ICONS, CATEGORIE_LABEL_KEYS, CATEGORIE_TONES } from "./fournisseurLabels"
import type { FournisseurSummary } from "@/lib/fournisseurCalc"
import type { Fournisseur } from "@/types/fournisseur"

interface FournisseurCardProps {
  fournisseur: Fournisseur
  summary: FournisseurSummary
}

export function FournisseurCard({ fournisseur, summary }: FournisseurCardProps) {
  const { t } = useTranslation()
  const Icon = CATEGORIE_ICONS[fournisseur.categorie]
  const isActive = fournisseur.statut === "actif"

  return (
    <Link
      to={`/app/fournisseurs/${fournisseur.id}`}
      className="glass-surface flex h-full flex-col rounded-xl p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{fournisseur.nom}</p>
            <StatusBadge
              label={t(CATEGORIE_LABEL_KEYS[fournisseur.categorie])}
              tone={CATEGORIE_TONES[fournisseur.categorie]}
            />
          </div>
        </div>
        <StatusBadge
          label={isActive ? t("fournisseurs.statusActive") : t("fournisseurs.statusInactive")}
          tone={isActive ? "success" : "muted"}
        />
      </div>

      <ul className="mb-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{fournisseur.contact}</span>
        </li>
        {fournisseur.telephone && (
          <li className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{fournisseur.telephone}</span>
          </li>
        )}
        {fournisseur.adresse && (
          <li className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{fournisseur.adresse}</span>
          </li>
        )}
      </ul>

      {fournisseur.produits.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {fournisseur.produits.slice(0, 3).map((produit) => (
            <span key={produit} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {produit}
            </span>
          ))}
          {fournisseur.produits.length > 3 && (
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              +{fournisseur.produits.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
        <div className="min-w-0">
          <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">{t("fournisseurs.kpiTotalPurchases")}</p>
          <p className="truncate text-sm font-semibold tabular-nums text-foreground">{formatCurrency(summary.totalAchats)}</p>
        </div>
        <div className="min-w-0">
          <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">{t("fournisseurs.kpiTotalPaid")}</p>
          <p className="truncate text-sm font-semibold tabular-nums text-success">{formatCurrency(summary.totalPaye)}</p>
        </div>
        <div className="min-w-0">
          <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">{t("fournisseurs.colRating")}</p>
          <span className="mt-0.5 inline-flex justify-center">
            <Rating value={fournisseur.note} showValue={false} />
          </span>
        </div>
      </div>
    </Link>
  )
}
