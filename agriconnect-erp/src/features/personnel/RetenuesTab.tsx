import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { HandCoins, Users, Wallet } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { usePersonnelStore } from "./personnelStore"
import { useInvoicesStore } from "@/features/clients/invoicesStore"
import { useStockStore } from "@/features/stocks/stockStore"
import { buildRetenues, retenuesEnAttente, retenuesParEmploye, totalRestant, type RetenueLine } from "@/lib/personnelCalc"
import { formatCurrency, formatDate } from "@/lib/format"

export function RetenuesTab() {
  const { t } = useTranslation()
  const { employes, fetchAll: fetchEmployes } = usePersonnelStore()
  const { invoices, isLoading, fetchAll: fetchInvoices } = useInvoicesStore()
  const { articles, fetchAll: fetchStock } = useStockStore()

  useEffect(() => {
    fetchEmployes()
    fetchInvoices()
    fetchStock()
  }, [fetchEmployes, fetchInvoices, fetchStock])

  const lines = useMemo(
    () => buildRetenues(invoices, employes, (id) => articles.find((a) => a.id === id)?.nom),
    [invoices, employes, articles]
  )
  const enAttente = retenuesEnAttente(lines)
  const parEmploye = retenuesParEmploye(enAttente, employes)
  const reste = totalRestant(enAttente)

  function employeName(id: string): string {
    return employes.find((e) => e.id === id)?.nom ?? "—"
  }

  const columns: DataTableColumn<RetenueLine>[] = [
    { key: "date", label: t("production.common.date"), render: (line) => formatDate(line.date) },
    { key: "employe", label: t("personnel.colEmploye"), render: (line) => employeName(line.employeId) },
    { key: "produit", label: t("personnel.colProduct"), render: (line) => line.produit || <span className="text-muted-foreground">—</span> },
    { key: "numero", label: t("clients.invoices.colNumber"), render: (line) => line.numero },
    { key: "montant", label: t("clients.invoices.colTotal"), render: (line) => formatCurrency(line.montant) },
    { key: "regle", label: t("clients.invoices.colPaid"), render: (line) => formatCurrency(line.montantRegle) },
    {
      key: "reste",
      label: t("clients.invoices.colDue"),
      render: (line) =>
        line.reste > 0 ? (
          <StatusBadge label={formatCurrency(line.reste)} tone={line.montantRegle > 0 ? "warning" : "destructive"} />
        ) : (
          <StatusBadge label={t("personnel.statusSettled")} tone="success" />
        ),
    },
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={HandCoins} label={t("personnel.statPending")} value={formatCurrency(reste)} tone={reste > 0 ? "warning" : "success"} />
        <StatCard icon={Users} label={t("personnel.statStaffConcerned")} value={String(parEmploye.length)} tone="info" />
        <StatCard icon={Wallet} label={t("personnel.statLines")} value={String(enAttente.length)} tone="primary" />
      </div>

      {parEmploye.length > 0 && (
        <div className="mb-4 rounded-xl border border-border bg-surface p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">{t("personnel.byEmployeTitle")}</p>
          <ul className="flex flex-col gap-2">
            {parEmploye.map((entry) => (
              <li key={entry.employe.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-foreground">
                  {entry.employe.nom}
                  <span className="ml-2 text-xs text-muted-foreground">{entry.employe.departement}</span>
                </span>
                <span className="font-medium text-warning">{formatCurrency(entry.reste)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={enAttente}
        rowKey={(line) => line.invoiceId}
        isLoading={isLoading}
        emptyIcon={HandCoins}
        emptyTitle={t("personnel.retenuesEmptyTitle")}
        emptyDescription={t("personnel.retenuesEmptyDescription")}
      />
    </div>
  )
}
