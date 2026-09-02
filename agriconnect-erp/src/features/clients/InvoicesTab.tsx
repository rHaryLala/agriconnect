import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Plus, Receipt, TrendingUp, TrendingDown, Wallet, CreditCard, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { InvoiceFormDialog } from "./InvoiceFormDialog"
import { RecordPaymentDialog } from "./RecordPaymentDialog"
import { useInvoicesStore } from "./invoicesStore"
import { useClientsStore } from "./clientsStore"
import { useStockStore } from "@/features/stocks/stockStore"
import { PAYMENT_METHOD_LABEL_KEYS, INVOICE_STATUS_LABEL_KEYS, INVOICE_STATUS_TONES } from "./invoiceLabels"
import { computeInvoiceTotal, computeInvoiceDue, computeInvoiceStatus } from "@/types/invoice"
import { formatDate, formatCurrency } from "@/lib/format"
import type { Invoice } from "@/types/invoice"

export function InvoicesTab() {
  const { t } = useTranslation()
  const { invoices, isLoading, fetchAll, addInvoice, recordPayment, deleteInvoice } = useInvoicesStore()
  const clients = useClientsStore((s) => s.clients)
  const fetchClients = useClientsStore((s) => s.fetchAll)
  const articles = useStockStore((s) => s.articles)
  const fetchArticles = useStockStore((s) => s.fetchAll)

  const [formOpen, setFormOpen] = useState(false)
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    fetchAll()
    fetchClients()
    fetchArticles()
  }, [fetchAll, fetchClients, fetchArticles])

  const totalInvoiced = useMemo(() => invoices.reduce((sum, inv) => sum + computeInvoiceTotal(inv), 0), [invoices])
  const totalCollected = useMemo(() => invoices.reduce((sum, inv) => sum + inv.montantPaye, 0), [invoices])
  const totalDue = totalInvoiced - totalCollected

  function clientName(clientId: string): string {
    return clients.find((c) => c.id === clientId)?.nom ?? "—"
  }

  async function handleAdd(values: Omit<Invoice, "id" | "numero">) {
    await addInvoice(values)
    toast.success(t("clients.invoices.toastCreated"))
  }

  async function handlePayment(id: string, amount: number) {
    await recordPayment(id, amount)
    toast.success(t("clients.invoices.toastPaymentRecorded"))
  }

  const columns: DataTableColumn<Invoice>[] = [
    { key: "numero", label: t("clients.invoices.colNumber"), render: (inv) => <span className="font-medium text-primary">{inv.numero}</span> },
    { key: "client", label: t("clients.invoices.colClient"), render: (inv) => clientName(inv.clientId) },
    { key: "date", label: t("clients.invoices.colDate"), render: (inv) => formatDate(inv.date) },
    { key: "method", label: t("clients.invoices.colMethod"), render: (inv) => t(PAYMENT_METHOD_LABEL_KEYS[inv.paymentMethod]) },
    { key: "total", label: t("clients.invoices.colTotal"), render: (inv) => formatCurrency(computeInvoiceTotal(inv)) },
    { key: "paid", label: t("clients.invoices.colPaid"), render: (inv) => formatCurrency(inv.montantPaye) },
    { key: "due", label: t("clients.invoices.colDue"), render: (inv) => formatCurrency(computeInvoiceDue(inv)) },
    {
      key: "status", label: t("clients.invoices.colStatus"),
      render: (inv) => {
        const status = computeInvoiceStatus(inv)
        return <StatusBadge label={t(INVOICE_STATUS_LABEL_KEYS[status])} tone={INVOICE_STATUS_TONES[status]} />
      },
    },
    {
      key: "actions", label: "", className: "text-right", sticky: true,
      render: (inv) => {
        const status = computeInvoiceStatus(inv)
        const canPay = status === "impayee" || status === "partielle"
        return (
          <div className="flex justify-end gap-1">
            {canPay && (
              <Button variant="ghost" size="icon" onClick={() => setPayingInvoice(inv)} aria-label={t("clients.invoices.recordPayment")} title={t("clients.invoices.recordPayment")}>
                <CreditCard className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => { deleteInvoice(inv.id); toast.success(t("clients.invoices.toastDeleted")) }} aria-label={t("common.delete")}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={TrendingUp} label={t("clients.invoices.statInvoiced")} value={formatCurrency(totalInvoiced)} tone="primary" hint={t("clients.invoices.statInvoicesCount", { count: invoices.length })} />
        <StatCard icon={Wallet} label={t("clients.invoices.statCollected")} value={formatCurrency(totalCollected)} tone="success" />
        <StatCard icon={TrendingDown} label={t("clients.invoices.statDue")} value={formatCurrency(totalDue)} tone={totalDue > 0 ? "warning" : "success"} />
      </div>

      <div className="mb-3 flex justify-end">
        <Button onClick={() => setFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("clients.invoices.newInvoice")}
        </Button>
      </div>

      <DataTable columns={columns} rows={invoices} rowKey={(inv) => inv.id} isLoading={isLoading} emptyIcon={Receipt} emptyTitle={t("clients.invoices.emptyTitle")} emptyDescription={t("clients.invoices.emptyDescription")} />

      <InvoiceFormDialog open={formOpen} onOpenChange={setFormOpen} clients={clients} articles={articles} onSubmit={handleAdd} />
      <RecordPaymentDialog open={!!payingInvoice} onOpenChange={(open) => !open && setPayingInvoice(null)} invoice={payingInvoice} onSubmit={handlePayment} />
    </div>
  )
}