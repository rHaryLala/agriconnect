import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { SimpleTabs } from "@/components/shared/SimpleTabs"
import { FinancialReportTab } from "./FinancialReportTab"
import { ProductionReportTab } from "./ProductionReportTab"
import { StockReportTab } from "./StockReportTab"
import { MonthlyRecapTab } from "./MonthlyRecapTab"
import { useFinanceStore } from "@/features/finance/financeStore"
import { useStockStore } from "@/features/stocks/stockStore"
import { useProductionStore } from "@/features/production/productionStore"
import { useBovinsStore } from "@/features/production/bovinsStore"
import { usePoulardStore } from "@/features/production/poulardStore"
import { useRizStore } from "@/features/production/rizStore"
import { useHaricotsStore } from "@/features/production/haricotsStore"
import { useEggSalesStore } from "@/features/production/eggSalesStore"
import { useEggPricesStore } from "@/features/production/eggPricesStore"
import { useInvoicesStore } from "@/features/clients/invoicesStore"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { currentIsoDate, periodBounds, type Periodicity } from "@/lib/dateRange"
import { formatDate, formatMonthLabel } from "@/lib/format"

const PERIODICITIES: Periodicity[] = ["day", "week", "month", "year"]
const PERIODICITY_LABEL_KEYS: Record<Periodicity, string> = {
  day: "rapports.periodicityDay",
  week: "rapports.periodicityWeek",
  month: "rapports.periodicityMonth",
  year: "rapports.periodicityYear",
}

export default function RapportsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("financier")
  const [periodicity, setPeriodicity] = useState<Periodicity>("month")
  const [anchorDate, setAnchorDate] = useState(currentIsoDate())

  const { transactions, fetchAll: fetchFinance } = useFinanceStore()
  const { articles, movements, fetchAll: fetchStock } = useStockStore()
  const { poules, vaches, kuroiler, cultures, fetchAll: fetchProduction } = useProductionStore()
  const { animaux, fetchAll: fetchBovins } = useBovinsStore()
  const { mouvements: poulardMouvements, fetchAll: fetchPoulard } = usePoulardStore()
  const { recoltes, ventes: rizVentes, fetchAll: fetchRiz } = useRizStore()
  const { mouvements: haricotMouvements, fetchAll: fetchHaricots } = useHaricotsStore()
  const { sales: eggSales, fetchAll: fetchEggSales } = useEggSalesStore()
  const eggPrices = useEggPricesStore((s) => s.prices)
  const { invoices, fetchAll: fetchInvoices } = useInvoicesStore()

  useEffect(() => {
    fetchFinance()
    fetchStock()
    fetchProduction()
    fetchBovins()
    fetchPoulard()
    fetchRiz()
    fetchHaricots()
    fetchEggSales()
    fetchInvoices()
  }, [fetchFinance, fetchStock, fetchProduction, fetchBovins, fetchPoulard, fetchRiz, fetchHaricots, fetchEggSales, fetchInvoices])

  const period = useMemo(() => periodBounds(periodicity, anchorDate), [periodicity, anchorDate])
  const periodLabel = useMemo(() => {
    switch (periodicity) {
      case "day": return formatDate(period.start)
      case "week": return t("rapports.weekLabel", { start: formatDate(period.start), end: formatDate(period.end) })
      case "month": return formatMonthLabel(anchorDate.slice(0, 7))
      case "year": return anchorDate.slice(0, 4)
    }
  }, [periodicity, period, anchorDate, t])

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 8 }, (_, i) => String(currentYear - i))

  const TABS = [
    { id: "financier", label: t("rapports.tabs.financial") },
    { id: "production", label: t("rapports.tabs.production") },
    { id: "stock", label: t("rapports.tabs.stock") },
    { id: "recap", label: t("rapports.tabs.recap") },
  ]

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="mb-1 text-2xl font-bold">{t("rapports.pageTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("rapports.pageSubtitle")}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="report-periodicity" className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("rapports.periodicityLabel")}</label>
            <Select value={periodicity} onValueChange={(value) => setPeriodicity(value as Periodicity)}>
              <SelectTrigger id="report-periodicity" className="w-44">
                <SelectValue>{(value: Periodicity | null) => t(PERIODICITY_LABEL_KEYS[value ?? "month"])}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PERIODICITIES.map((value) => (
                  <SelectItem key={value} value={value}>{t(PERIODICITY_LABEL_KEYS[value])}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="report-anchor" className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("rapports.periodLabel")}</label>
            {periodicity === "year" ? (
              <Select value={anchorDate.slice(0, 4)} onValueChange={(value) => setAnchorDate(`${value}-01-01`)}>
                <SelectTrigger id="report-anchor" className="w-44">
                  <SelectValue>{(value: string | null) => value ?? ""}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : periodicity === "month" ? (
              <input
                id="report-anchor"
                type="month"
                value={anchorDate.slice(0, 7)}
                onChange={(e) => e.target.value && setAnchorDate(`${e.target.value}-01`)}
                className="h-9 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <input
                id="report-anchor"
                type="date"
                value={anchorDate}
                onChange={(e) => e.target.value && setAnchorDate(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            )}
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {t("rapports.periodSummary", { period: periodLabel })}
      </p>

      <SimpleTabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      <div key={`${activeTab}-${periodicity}-${anchorDate}`} className="animate-content-in mt-4">
        {activeTab === "financier" && <FinancialReportTab transactions={transactions} period={period} periodLabel={periodLabel} />}
        {activeTab === "production" && (
          <ProductionReportTab
            period={period}
            periodLabel={periodLabel}
            poules={poules}
            vaches={vaches}
            kuroiler={kuroiler}
            cultures={cultures}
            bovins={animaux}
            poulard={poulardMouvements}
            rizRecoltes={recoltes}
            rizVentes={rizVentes}
            haricots={haricotMouvements}
          />
        )}
        {activeTab === "stock" && <StockReportTab articles={articles} movements={movements} period={period} periodLabel={periodLabel} />}
        {activeTab === "recap" && (
          <MonthlyRecapTab
            period={period}
            periodLabel={periodLabel}
            eggSales={eggSales}
            eggPrices={eggPrices}
            bovins={animaux}
            poulard={poulardMouvements}
            rizVentes={rizVentes}
            haricots={haricotMouvements}
            invoices={invoices}
          />
        )}
      </div>
    </div>
  )
}
