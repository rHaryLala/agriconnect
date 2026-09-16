import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import {
  ArrowLeft, ChevronRight, Pencil, Plus, Wallet, Clock, ShoppingBag,
  Mail, Phone, MapPin, User, CalendarClock, CalendarDays,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SimpleTabs } from "@/components/shared/SimpleTabs"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Rating } from "@/components/shared/Rating"
import { EmptyState } from "@/components/shared/EmptyState"
import { ReadOnlyBanner } from "@/components/shared/ReadOnlyBanner"
import { usePermission } from "@/hooks/usePermission"
import { formatCurrency, formatDate } from "@/lib/format"
import { achatStatut, achatsOf, paiementsOf, summarise } from "@/lib/fournisseurCalc"
import { FournisseurFormDialog } from "./FournisseurFormDialog"
import { PurchaseDialog } from "./PurchaseDialog"
import { useFournisseursStore } from "./fournisseursStore"
import { CATEGORIE_ICONS, CATEGORIE_LABEL_KEYS, PAYMENT_METHOD_LABEL_KEYS } from "./fournisseurLabels"
import type { AchatFournisseur, Fournisseur } from "@/types/fournisseur"

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm text-foreground">{value}</p>
      </div>
    </div>
  )
}

function PurchasesTable({ achats }: { achats: AchatFournisseur[] }) {
  const { t } = useTranslation()

  if (achats.length === 0) {
    return <EmptyState icon={ShoppingBag} title={t("fournisseurs.noPurchases")} description={t("fournisseurs.noPurchasesDescription")} />
  }

  const totals = summarise(achats)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-background text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="whitespace-nowrap px-4 py-3 text-left font-medium">{t("fournisseurs.purchaseRef")}</th>
            <th scope="col" className="whitespace-nowrap px-4 py-3 text-left font-medium">{t("fournisseurs.purchaseDate")}</th>
            <th scope="col" className="px-4 py-3 text-left font-medium">{t("fournisseurs.purchaseDescription")}</th>
            <th scope="col" className="whitespace-nowrap px-4 py-3 text-right font-medium">{t("fournisseurs.purchaseAmount")}</th>
            <th scope="col" className="whitespace-nowrap px-4 py-3 text-right font-medium">{t("fournisseurs.purchasePaid")}</th>
            <th scope="col" className="whitespace-nowrap px-4 py-3 text-left font-medium">{t("fournisseurs.purchaseStatus")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {achats.map((achat) => {
            const settled = achatStatut(achat) === "regle"
            return (
              <tr key={achat.id} className="transition-colors hover:bg-background">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{achat.reference}</td>
                <td className="whitespace-nowrap px-4 py-3">{formatDate(achat.date)}</td>
                <td className="px-4 py-3 text-foreground">{achat.description}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{formatCurrency(achat.montant)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-success">{formatCurrency(achat.montantPaye)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusBadge
                    label={settled ? t("fournisseurs.statusSettled") : t("fournisseurs.statusPending")}
                    tone={settled ? "success" : "warning"}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border bg-background font-semibold">
            <td className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground" colSpan={3}>
              {t("fournisseurs.totals")}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-foreground">{formatCurrency(totals.totalAchats)}</td>
            <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-success">{formatCurrency(totals.totalPaye)}</td>
            <td className="px-4 py-3" />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default function FournisseurDetailPage() {
  const { t } = useTranslation()
  const { fournisseurId } = useParams()
  const navigate = useNavigate()
  const { canEdit } = usePermission("finance")

  const { fournisseurs, achats, paiements, fetchAll, updateFournisseur, addAchat } = useFournisseursStore()
  const [activeTab, setActiveTab] = useState("achats")
  const [formOpen, setFormOpen] = useState(false)
  const [purchaseOpen, setPurchaseOpen] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const fournisseur = fournisseurs.find((item) => item.id === fournisseurId)

  const ownAchats = useMemo(
    () => achatsOf(achats, fournisseurId ?? "").sort((a, b) => b.date.localeCompare(a.date)),
    [achats, fournisseurId],
  )
  const ownPaiements = useMemo(
    () => paiementsOf(paiements, fournisseurId ?? "").sort((a, b) => b.date.localeCompare(a.date)),
    [paiements, fournisseurId],
  )
  const summary = useMemo(() => summarise(ownAchats), [ownAchats])

  if (!fournisseur) {
    return (
      <div>
        <Button variant="ghost" onClick={() => navigate("/app/fournisseurs")} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("fournisseurs.backToList")}
        </Button>
        <EmptyState icon={ShoppingBag} title={t("fournisseurs.notFound")} description={t("fournisseurs.notFoundDescription")} />
      </div>
    )
  }

  const Icon = CATEGORIE_ICONS[fournisseur.categorie]
  const isActive = fournisseur.statut === "actif"
  const nextReference = `ACH-${new Date().getFullYear()}-${String(achats.length + 1).padStart(3, "0")}`
  const pendingCount = ownAchats.filter((achat) => achatStatut(achat) === "en_attente").length

  async function handleEdit(values: Omit<Fournisseur, "id">) {
    if (!fournisseur) return
    await updateFournisseur(fournisseur.id, values)
    toast.success(t("fournisseurs.toastModified"))
  }

  async function handleAddPurchase(values: Omit<AchatFournisseur, "id" | "fournisseurId">) {
    if (!fournisseur) return
    await addAchat({ ...values, fournisseurId: fournisseur.id })
    toast.success(t("fournisseurs.toastPurchaseAdded"))
  }

  const TABS = [
    { id: "achats", label: `${t("fournisseurs.tabsPurchases")} (${ownAchats.length})` },
    { id: "paiements", label: `${t("fournisseurs.tabsPayments")} (${ownPaiements.length})` },
  ]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/app/fournisseurs")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t("fournisseurs.back")}</span>
          </Button>
          <nav aria-label="breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
            <Link to="/app/fournisseurs" className="text-muted-foreground transition-colors hover:text-foreground">
              {t("fournisseurs.pageTitle")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium text-foreground">{fournisseur.nom}</span>
          </nav>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setFormOpen(true)} className="gap-2">
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">{t("fournisseurs.edit")}</span>
            </Button>
            <Button onClick={() => setPurchaseOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("fournisseurs.newPurchase")}</span>
            </Button>
          </div>
        )}
      </div>

      {!canEdit && <ReadOnlyBanner />}

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <div className="glass-surface rounded-xl p-5 shadow-sm lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-xl font-bold text-foreground">{fournisseur.nom}</h2>
                  <StatusBadge
                    label={isActive ? t("fournisseurs.statusActive") : t("fournisseurs.statusInactive")}
                    tone={isActive ? "success" : "muted"}
                  />
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  <span className="font-mono">{fournisseur.id.toUpperCase()}</span>
                  {" · "}
                  {t(CATEGORIE_LABEL_KEYS[fournisseur.categorie])}
                </p>
                <span className="mt-1 inline-flex">
                  <Rating value={fournisseur.note} size="md" showValue={false} />
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow icon={User} label={t("fournisseurs.fieldContact")} value={fournisseur.contact} />
            <InfoRow icon={Phone} label={t("fournisseurs.fieldPhone")} value={fournisseur.telephone ?? "—"} />
            <InfoRow icon={Mail} label={t("fournisseurs.fieldEmail")} value={fournisseur.email ?? "—"} />
            <InfoRow icon={MapPin} label={t("fournisseurs.fieldAddress")} value={fournisseur.adresse ?? "—"} />
            <InfoRow
              icon={CalendarClock}
              label={t("fournisseurs.fieldPaymentTerms")}
              value={t("fournisseurs.paymentTermsValue", { count: fournisseur.delaiPaiementJours })}
            />
            <InfoRow
              icon={CalendarDays}
              label={t("fournisseurs.fieldLastPurchase")}
              value={summary.dernierAchat ? formatDate(summary.dernierAchat) : t("fournisseurs.never")}
            />
          </div>

          {fournisseur.produits.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">{t("fournisseurs.productsSupplied")}</p>
              <div className="flex flex-wrap gap-1.5">
                {fournisseur.produits.map((produit) => (
                  <span key={produit} className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    {produit}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <StatCard icon={ShoppingBag} tone="primary" label={t("fournisseurs.kpiTotalPurchases")} value={formatCurrency(summary.totalAchats)} hint={t("fournisseurs.statPurchasesYtdHint", { count: summary.nombreAchats })} />
          <StatCard icon={Wallet} tone="success" label={t("fournisseurs.kpiTotalPaid")} value={formatCurrency(summary.totalPaye)} />
          <StatCard
          icon={Clock}
          tone="warning"
          label={t("fournisseurs.kpiPending")}
          value={t("fournisseurs.pendingOrders", { count: pendingCount })}
          hint={pendingCount > 0 ? formatCurrency(summary.enAttente) : undefined}
        />
        </div>
      </div>

      <div className="mt-6">
        <SimpleTabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

        <div key={activeTab} className="animate-content-in mt-4 overflow-hidden rounded-xl border border-border bg-surface">
          {activeTab === "achats" && <PurchasesTable achats={ownAchats} />}

          {activeTab === "paiements" &&
            (ownPaiements.length === 0 ? (
              <EmptyState icon={Wallet} title={t("fournisseurs.noPayments")} description={t("fournisseurs.noPaymentsDescription")} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-background text-xs uppercase tracking-wide text-muted-foreground">
                      <th scope="col" className="whitespace-nowrap px-4 py-3 text-left font-medium">{t("fournisseurs.paymentDate")}</th>
                      <th scope="col" className="whitespace-nowrap px-4 py-3 text-left font-medium">{t("fournisseurs.paymentPurchase")}</th>
                      <th scope="col" className="whitespace-nowrap px-4 py-3 text-left font-medium">{t("fournisseurs.paymentMethod")}</th>
                      <th scope="col" className="whitespace-nowrap px-4 py-3 text-right font-medium">{t("fournisseurs.paymentAmount")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ownPaiements.map((paiement) => {
                      const achat = ownAchats.find((item) => item.id === paiement.achatId)
                      return (
                        <tr key={paiement.id} className="transition-colors hover:bg-background">
                          <td className="whitespace-nowrap px-4 py-3">{formatDate(paiement.date)}</td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                            {achat?.reference ?? paiement.reference ?? "—"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {PAYMENT_METHOD_LABEL_KEYS[paiement.moyen] ? t(PAYMENT_METHOD_LABEL_KEYS[paiement.moyen]) : paiement.moyen}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-success">{formatCurrency(paiement.montant)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-background font-semibold">
                      <td className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground" colSpan={3}>
                        {t("fournisseurs.totals")}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-success">
                        {formatCurrency(ownPaiements.reduce((total, paiement) => total + paiement.montant, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ))}
        </div>
      </div>

      {canEdit && (
        <>
          <FournisseurFormDialog open={formOpen} onOpenChange={setFormOpen} editingFournisseur={fournisseur} onSubmit={handleEdit} />
          <PurchaseDialog open={purchaseOpen} onOpenChange={setPurchaseOpen} nextReference={nextReference} onSubmit={handleAddPurchase} />
        </>
      )}
    </div>
  )
}
