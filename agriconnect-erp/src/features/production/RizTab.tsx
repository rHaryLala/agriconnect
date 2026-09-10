import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, Wheat, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { SimpleTabs } from "@/components/shared/SimpleTabs"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { RizRecolteDialog } from "./RizRecolteDialog"
import { RizSechageDialog } from "./RizSechageDialog"
import { RizDecorticageDialog } from "./RizDecorticageDialog"
import { RizVenteDialog } from "./RizVenteDialog"
import { useRizStore } from "./rizStore"
import { useInvoicesStore } from "@/features/clients/invoicesStore"
import { useClientsStore } from "@/features/clients/clientsStore"
import { formatDate, formatNumber, formatCurrency } from "@/lib/format"
import { computeStockPaddyBrut, computeStockPaddySeche, computeStockRizDecortique } from "@/lib/rizCalc"
import type { RizRecolte, RizSechageEvent, RizDecorticage, RizVente } from "@/types/production"

export function RizTab({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation()
  const {
    recoltes, sechageEvents, decorticages, ventes, isLoading, fetchAll,
    addRecolte, addSechageEvent, addDecorticage, addVente, linkInvoice,
    deleteRecolte, deleteSechageEvent, deleteDecorticage, deleteVente,
  } = useRizStore()
  const { addInvoice, invoices } = useInvoicesStore()
  const { clients, fetchAll: fetchClients } = useClientsStore()

  const [subTab, setSubTab] = useState("recolte")
  const [recolteOpen, setRecolteOpen] = useState(false)
  const [sechageOpen, setSechageOpen] = useState(false)
  const [decorticageOpen, setDecorticageOpen] = useState(false)
  const [venteOpen, setVenteOpen] = useState(false)

  useEffect(() => {
    fetchAll()
    fetchClients()
  }, [fetchAll, fetchClients])

  const stockPaddyBrut = computeStockPaddyBrut(recoltes, sechageEvents)
  const stockPaddySeche = computeStockPaddySeche(sechageEvents, decorticages)
  const stockRizDecortique = computeStockRizDecortique(decorticages, ventes)

  function clientName(id: string): string {
    return clients.find((c) => c.id === id)?.nom ?? "—"
  }

  function recuNumero(invoiceId?: string): string {
    if (!invoiceId) return "—"
    return invoices.find((inv) => inv.id === invoiceId)?.numero ?? "—"
  }

  async function handleAddVente(data: Omit<RizVente, "id">) {
    const created = await addVente(data)
    const total = data.quantiteKg * data.prixUnitaire
    const invoice = await addInvoice({
      clientId: data.clientId,
      date: data.date,
      paymentMethod: data.paymentMethod,
      items: [{ quantite: data.quantiteKg, prixUnitaire: data.prixUnitaire }],
      montantPaye: data.paymentMethod === "comptant" ? total : 0,
    })
    linkInvoice(created.id, invoice.id)
    toast.success(t("production.riz.toastCreated"))
  }

  const SUB_TABS = [
    { id: "recolte", label: t("production.riz.subTabRecolte") },
    { id: "sechage", label: t("production.riz.subTabSechage") },
    { id: "decortique", label: t("production.riz.subTabDecortique") },
  ]

  const recolteColumns: DataTableColumn<RizRecolte>[] = [
    { key: "date", label: t("production.riz.fieldDate"), render: (r) => formatDate(r.date) },
    { key: "sacs", label: t("production.riz.fieldSacs"), render: (r) => formatNumber(r.sacs) },
    { key: "quantiteKg", label: t("production.riz.fieldQuantiteKg"), render: (r) => `${formatNumber(r.quantiteKg)} kg` },
    { key: "transport", label: t("production.riz.fieldTransport"), render: (r) => r.transport || "—" },
    { key: "conducteur", label: t("production.riz.fieldConducteur"), render: (r) => r.conducteur || "—" },
    { key: "magasinier", label: t("production.riz.fieldMagasinier"), render: (r) => r.magasinier || "—" },
    { key: "observation", label: t("production.common.observation"), render: (r) => <span className="text-muted-foreground">{r.observation}</span> },
    ...(canEdit
      ? [{
          key: "actions", label: "", className: "text-right", sticky: true,
          render: (r: RizRecolte) => (
            <Button variant="ghost" size="icon" onClick={() => { deleteRecolte(r.id); toast.success(t("production.riz.toastDeleted")) }} aria-label={t("common.delete")}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          ),
        } as DataTableColumn<RizRecolte>]
      : []),
  ]

  const sechageColumns: DataTableColumn<RizSechageEvent>[] = [
    { key: "date", label: t("production.riz.fieldDate"), render: (e) => formatDate(e.date) },
    { key: "type", label: t("production.riz.fieldSechageType"), render: (e) => t(e.type === "finalisation" ? "production.riz.sechageTypeFinalisation" : "production.riz.sechageTypePassage") },
    { key: "sortie", label: t("production.riz.fieldQuantiteSortie"), render: (e) => (e.quantiteSortie !== undefined ? `${formatNumber(e.quantiteSortie)} kg` : "—") },
    { key: "retournee", label: t("production.riz.fieldQuantiteRetournee"), render: (e) => (e.quantiteRetournee !== undefined ? `${formatNumber(e.quantiteRetournee)} kg` : "—") },
    { key: "sacs", label: t("production.riz.fieldSacs"), render: (e) => (e.sacs !== undefined ? formatNumber(e.sacs) : "—") },
    { key: "quantiteKg", label: t("production.riz.fieldQuantiteKg"), render: (e) => (e.quantiteKg !== undefined ? `${formatNumber(e.quantiteKg)} kg` : "—") },
    { key: "observation", label: t("production.common.observation"), render: (e) => <span className="text-muted-foreground">{e.observation}</span> },
    ...(canEdit
      ? [{
          key: "actions", label: "", className: "text-right", sticky: true,
          render: (e: RizSechageEvent) => (
            <Button variant="ghost" size="icon" onClick={() => { deleteSechageEvent(e.id); toast.success(t("production.riz.toastDeleted")) }} aria-label={t("common.delete")}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          ),
        } as DataTableColumn<RizSechageEvent>]
      : []),
  ]

  const decorticageColumns: DataTableColumn<RizDecorticage>[] = [
    { key: "date", label: t("production.riz.fieldDate"), render: (d) => formatDate(d.date) },
    { key: "paddy", label: t("production.riz.fieldQuantitePaddyUtilisee"), render: (d) => `${formatNumber(d.quantitePaddyKg)} kg` },
    { key: "riz", label: t("production.riz.fieldQuantiteRizObtenu"), render: (d) => `${formatNumber(d.quantiteRizKg)} kg` },
    { key: "observation", label: t("production.common.observation"), render: (d) => <span className="text-muted-foreground">{d.observation}</span> },
    ...(canEdit
      ? [{
          key: "actions", label: "", className: "text-right", sticky: true,
          render: (d: RizDecorticage) => (
            <Button variant="ghost" size="icon" onClick={() => { deleteDecorticage(d.id); toast.success(t("production.riz.toastDeleted")) }} aria-label={t("common.delete")}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          ),
        } as DataTableColumn<RizDecorticage>]
      : []),
  ]

  const venteColumns: DataTableColumn<RizVente>[] = [
    { key: "date", label: t("production.riz.fieldDate"), render: (v) => formatDate(v.date) },
    { key: "client", label: t("clients.invoices.colClient"), render: (v) => clientName(v.clientId) },
    { key: "quantiteKg", label: t("production.riz.fieldQuantiteKg"), render: (v) => `${formatNumber(v.quantiteKg)} kg` },
    { key: "prixUnitaire", label: t("production.riz.fieldPrixUnitaire"), render: (v) => formatCurrency(v.prixUnitaire) },
    { key: "paymentMethod", label: t("production.riz.fieldPaymentMethod"), render: (v) => t(`clients.invoices.payment${v.paymentMethod === "salaire" ? "Salaire" : v.paymentMethod === "commande" ? "Commande" : "Comptant"}`) },
    { key: "numeroRecu", label: t("production.poulard.colReceiptNumber"), render: (v) => recuNumero(v.invoiceId) },
    { key: "observation", label: t("production.common.observation"), render: (v) => <span className="text-muted-foreground">{v.observation}</span> },
    ...(canEdit
      ? [{
          key: "actions", label: "", className: "text-right", sticky: true,
          render: (v: RizVente) => (
            <Button variant="ghost" size="icon" onClick={() => { deleteVente(v.id); toast.success(t("production.riz.toastDeleted")) }} aria-label={t("common.delete")}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          ),
        } as DataTableColumn<RizVente>]
      : []),
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Wheat} label={t("production.riz.statStockPaddyBrut")} value={`${formatNumber(stockPaddyBrut)} kg`} tone="primary" />
        <StatCard icon={Wheat} label={t("production.riz.statStockPaddySeche")} value={`${formatNumber(stockPaddySeche)} kg`} tone="warning" />
        <StatCard icon={Wheat} label={t("production.riz.statStockRizDecortique")} value={`${formatNumber(stockRizDecortique)} kg`} tone="success" />
      </div>

      <SimpleTabs tabs={SUB_TABS} activeId={subTab} onChange={setSubTab} />

      <div key={subTab} className="animate-content-in mt-4">
        {subTab === "recolte" && (
          <div>
            {canEdit && (
              <div className="mb-3 flex justify-end">
                <Button onClick={() => setRecolteOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("production.riz.newRecolte")}
                </Button>
              </div>
            )}
            <DataTable columns={recolteColumns} rows={recoltes} rowKey={(r) => r.id} isLoading={isLoading} emptyIcon={Wheat} emptyTitle={t("production.riz.emptyTitle")} emptyDescription={t("production.riz.emptyDescription")} />
          </div>
        )}

        {subTab === "sechage" && (
          <div>
            {canEdit && (
              <div className="mb-3 flex justify-end">
                <Button onClick={() => setSechageOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("production.riz.newSechageEvent")}
                </Button>
              </div>
            )}
            <DataTable columns={sechageColumns} rows={sechageEvents} rowKey={(e) => e.id} isLoading={isLoading} emptyIcon={Wheat} emptyTitle={t("production.riz.emptyTitle")} emptyDescription={t("production.riz.emptyDescription")} />
          </div>
        )}

        {subTab === "decortique" && (
          <div>
            {canEdit && (
              <div className="mb-3 flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={() => setDecorticageOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("production.riz.newDecorticage")}
                </Button>
                <Button onClick={() => setVenteOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("production.riz.newVente")}
                </Button>
              </div>
            )}
            <p className="mb-2 text-xs font-medium text-muted-foreground">{t("production.riz.subSectionDecorticage")}</p>
            <DataTable columns={decorticageColumns} rows={decorticages} rowKey={(d) => d.id} isLoading={isLoading} emptyIcon={Wheat} emptyTitle={t("production.riz.emptyTitle")} emptyDescription={t("production.riz.emptyDescription")} />
            <p className="mt-6 mb-2 text-xs font-medium text-muted-foreground">{t("production.riz.subSectionVentes")}</p>
            <DataTable columns={venteColumns} rows={ventes} rowKey={(v) => v.id} isLoading={isLoading} emptyIcon={Wheat} emptyTitle={t("production.riz.emptyTitle")} emptyDescription={t("production.riz.emptyDescription")} />
          </div>
        )}
      </div>

      {canEdit && <RizRecolteDialog open={recolteOpen} onOpenChange={setRecolteOpen} onSubmit={async (d) => { await addRecolte(d); toast.success(t("production.riz.toastCreated")) }} />}
      {canEdit && <RizSechageDialog open={sechageOpen} onOpenChange={setSechageOpen} onSubmit={async (d) => { await addSechageEvent(d); toast.success(t("production.riz.toastCreated")) }} />}
      {canEdit && <RizDecorticageDialog open={decorticageOpen} onOpenChange={setDecorticageOpen} stockPaddySeche={stockPaddySeche} onSubmit={async (d) => { await addDecorticage(d); toast.success(t("production.riz.toastCreated")) }} />}
      {canEdit && <RizVenteDialog open={venteOpen} onOpenChange={setVenteOpen} clients={clients} stockRizDecortique={stockRizDecortique} onSubmit={handleAddVente} />}
    </div>
  )
}
