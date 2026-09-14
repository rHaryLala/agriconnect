import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { CalendarClock, HandCoins, Users, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { QuickAddDialog, type FieldConfig } from "@/components/shared/QuickAddDialog"
import { usePersonnelStore } from "./personnelStore"
import { usePayrollSettingsStore } from "./payrollSettingsStore"
import { useRegularisationsStore } from "./regularisationsStore"
import { useInvoicesStore } from "@/features/clients/invoicesStore"
import { useStockStore } from "@/features/stocks/stockStore"
import { useAuthStore } from "@/features/auth/authStore"
import {
  buildRetenues,
  payrollWindow,
  retenuesEnAttente,
  retenuesParEmploye,
  totalRestant,
  type RetenueLine,
} from "@/lib/personnelCalc"
import { currentIsoDate } from "@/lib/dateRange"
import { formatCurrency, formatDate } from "@/lib/format"

type StatutFilter = "en_attente" | "regularise" | "tous"
type RegularisationValues = { date: string; montant: number }

export function RetenuesTab({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation()
  const { employes, fetchAll: fetchEmployes } = usePersonnelStore()
  const { invoices, isLoading, fetchAll: fetchInvoices, recordPayment } = useInvoicesStore()
  const { articles, fetchAll: fetchStock } = useStockStore()
  const { jourDebut, jourFin, setWindow } = usePayrollSettingsStore()
  const { regularisations, addRegularisation } = useRegularisationsStore()
  const currentUserName = useAuthStore((s) => s.user?.name)
  const [statutFilter, setStatutFilter] = useState<StatutFilter>("en_attente")
  const [settlingLine, setSettlingLine] = useState<RetenueLine | null>(null)

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
  const window = payrollWindow(currentIsoDate(), jourDebut, jourFin)

  const filtered = useMemo(
    () => (statutFilter === "tous" ? lines : lines.filter((line) => line.statut === statutFilter)),
    [lines, statutFilter]
  )

  function employeName(id: string): string {
    return employes.find((e) => e.id === id)?.nom ?? "—"
  }

  function lastRegularisation(invoiceId: string) {
    return regularisations.find((r) => r.invoiceId === invoiceId)
  }

  const regularisationSchema = useMemo(
    () =>
      z.object({
        date: z.string().min(1, t("stock.movements.validationDate")),
        montant: z
          .number({ error: t("stock.inventory.validationNumber") })
          .positive(t("personnel.validationSettlementAmount"))
          .max(settlingLine?.reste ?? 0, t("personnel.validationSettlementExceeds")),
      }),
    [t, settlingLine]
  )

  const regularisationFields: FieldConfig<RegularisationValues>[] = useMemo(
    () => [
      { type: "date", name: "date", label: t("personnel.fieldSettlementDate") },
      { type: "number", name: "montant", label: t("personnel.fieldSettlementAmount") },
    ],
    [t]
  )

  async function handleRegularisation(values: RegularisationValues) {
    if (!settlingLine) return
    await recordPayment(settlingLine.invoiceId, values.montant)
    addRegularisation({
      invoiceId: settlingLine.invoiceId,
      date: values.date,
      montant: values.montant,
      regularisePar: currentUserName ?? "—",
    })
    toast.success(t("personnel.toastSettlementRecorded"))
    setSettlingLine(null)
  }

  const columns: DataTableColumn<RetenueLine>[] = [
    { key: "date", label: t("production.common.date"), render: (line) => formatDate(line.date) },
    { key: "employe", label: t("personnel.colEmploye"), render: (line) => employeName(line.employeId) },
    { key: "produit", label: t("personnel.colProduct"), render: (line) => line.produit || <span className="text-muted-foreground">—</span> },
    { key: "numero", label: t("clients.invoices.colNumber"), render: (line) => line.numero },
    { key: "montant", label: t("clients.invoices.colTotal"), render: (line) => formatCurrency(line.montant) },
    { key: "regle", label: t("clients.invoices.colPaid"), render: (line) => formatCurrency(line.montantRegle) },
    {
      key: "statut",
      label: t("clients.invoices.colStatus"),
      render: (line) =>
        line.statut === "regularise" ? (
          <StatusBadge label={t("personnel.statusSettled")} tone="success" />
        ) : (
          <StatusBadge label={formatCurrency(line.reste)} tone={line.montantRegle > 0 ? "warning" : "destructive"} />
        ),
    },
    {
      key: "regularisePar",
      label: t("personnel.colSettledBy"),
      render: (line) => {
        const regularisation = lastRegularisation(line.invoiceId)
        return regularisation ? (
          <span className="text-muted-foreground">
            {regularisation.regularisePar} — {formatDate(regularisation.date)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    ...(canEdit
      ? [{
          key: "actions",
          label: "",
          className: "text-right",
          sticky: true,
          render: (line: RetenueLine) =>
            line.statut === "en_attente" ? (
              <Button variant="outline" size="sm" onClick={() => setSettlingLine(line)}>
                {t("personnel.settleAction")}
              </Button>
            ) : null,
        } as DataTableColumn<RetenueLine>]
      : []),
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={HandCoins} label={t("personnel.statPending")} value={formatCurrency(reste)} tone={reste > 0 ? "warning" : "success"} />
        <StatCard icon={Users} label={t("personnel.statStaffConcerned")} value={String(parEmploye.length)} tone="info" />
        <StatCard icon={Wallet} label={t("personnel.statLines")} value={String(enAttente.length)} tone="primary" />
      </div>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-4 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
            <CalendarClock className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{t("personnel.payrollWindowTitle")}</p>
            <p className="text-xs text-muted-foreground">
              {t("personnel.payrollWindowValue", { start: formatDate(window.start), end: formatDate(window.end) })}
            </p>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-end gap-2">
            <div>
              <Label htmlFor="jourDebut">{t("personnel.fieldWindowStart")}</Label>
              <input
                id="jourDebut"
                type="number"
                min={1}
                max={28}
                value={jourDebut}
                onChange={(e) => setWindow(Number(e.target.value), jourFin)}
                className="mt-1.5 w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <Label htmlFor="jourFin">{t("personnel.fieldWindowEnd")}</Label>
              <input
                id="jourFin"
                type="number"
                min={1}
                max={28}
                value={jourFin}
                onChange={(e) => setWindow(jourDebut, Number(e.target.value))}
                className="mt-1.5 w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}
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

      <div className="mb-3 flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1">
        {(["en_attente", "regularise", "tous"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatutFilter(f)}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-200 ${statutFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {f === "tous" ? t("stock.locations.all") : f === "en_attente" ? t("personnel.filterPending") : t("personnel.filterSettled")}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(line) => line.invoiceId}
        isLoading={isLoading}
        emptyIcon={HandCoins}
        emptyTitle={t("personnel.retenuesEmptyTitle")}
        emptyDescription={t("personnel.retenuesEmptyDescription")}
      />

      {canEdit && (
        <QuickAddDialog
          open={!!settlingLine}
          onOpenChange={(open) => !open && setSettlingLine(null)}
          title={t("personnel.settlementDialogTitle", { numero: settlingLine?.numero ?? "" })}
          schema={regularisationSchema}
          fields={regularisationFields}
          defaultValues={{ date: currentIsoDate(), montant: settlingLine?.reste ?? 0 }}
          onSubmit={handleRegularisation}
        />
      )}
    </div>
  )
}
