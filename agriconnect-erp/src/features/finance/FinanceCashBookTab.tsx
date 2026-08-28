import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Wallet, ArrowDownCircle, ArrowUpCircle, PiggyBank, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { useFinanceStore } from "./financeStore"
import { computeCashBook } from "@/lib/financeCalc"
import { formatDate, formatCurrency } from "@/lib/format"
import type { FinanceTransaction } from "@/types/finance"

interface FinanceCashBookTabProps {
  transactions: FinanceTransaction[]
}

export function FinanceCashBookTab({ transactions }: FinanceCashBookTabProps) {
  const soldeOuverture = useFinanceStore((s) => s.soldeOuverture)
  const setSoldeOuverture = useFinanceStore((s) => s.setSoldeOuverture)

  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        if (dateDebut && t.date < dateDebut) return false
        if (dateFin && t.date > dateFin) return false
        return true
      }),
    [transactions, dateDebut, dateFin]
  )

  const rows = useMemo(() => computeCashBook(filtered, soldeOuverture), [filtered, soldeOuverture])
  const totalEntrees = rows.reduce((sum, r) => sum + (r.entree ?? 0), 0)
  const totalSorties = rows.reduce((sum, r) => sum + (r.sortie ?? 0), 0)
  const soldeCloture = rows.length > 0 ? rows[rows.length - 1].solde : soldeOuverture

  function handleExport() {
    toast.info("Export PDF pas encore disponible — prévu avec le module Rapports.")
  }

  function handleSoldeOuvertureChange(raw: string) {
    const value = Number(raw)
    setSoldeOuverture(Number.isFinite(value) ? value : 0)
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="glass-surface rounded-xl p-4">
          <label className="mb-1 block text-xs text-muted-foreground">Solde d'ouverture</label>
          <input
            type="number"
            value={soldeOuverture}
            onChange={(e) => handleSoldeOuvertureChange(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-2 py-1 text-lg font-bold tabular-nums text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <StatCard icon={ArrowDownCircle} label="Total entrées" value={formatCurrency(totalEntrees)} tone="success" hint={`${rows.filter((r) => r.entree).length} opérations`} />
        <StatCard icon={ArrowUpCircle} label="Total sorties" value={formatCurrency(totalSorties)} tone="destructive" hint={`${rows.filter((r) => r.sortie).length} opérations`} />
        <StatCard icon={PiggyBank} label="Solde de clôture" value={formatCurrency(soldeCloture)} tone={soldeCloture >= 0 ? "success" : "destructive"} />
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5">
          <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="bg-transparent text-sm text-foreground outline-none" />
          <span className="text-xs text-muted-foreground">→</span>
          <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="bg-transparent text-sm text-foreground outline-none" />
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Exporter PDF
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Libellé</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Entrée</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Sortie</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Solde</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border bg-success/5">
                <td className="px-4 py-3 text-muted-foreground">—</td>
                <td className="px-4 py-3 font-medium text-success">Solde d'ouverture</td>
                <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">{formatCurrency(soldeOuverture)}</td>
              </tr>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border transition-colors last:border-0 hover:bg-background">
                  <td className="whitespace-nowrap px-4 py-3">{formatDate(row.date)}</td>
                  <td className="px-4 py-3">{row.libelle}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-success">{row.entree ? `+ ${formatCurrency(row.entree)}` : "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-destructive">{row.sortie ? `- ${formatCurrency(row.sortie)}` : "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-foreground">{formatCurrency(row.solde)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Aucune opération sur cette période.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}