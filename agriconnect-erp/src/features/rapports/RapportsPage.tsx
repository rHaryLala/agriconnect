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
import { currentIsoMonth, monthBounds } from "@/lib/dateRange"
import { formatMonthLabel } from "@/lib/format"

export default function RapportsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("financier")
  const [isoMonth, setIsoMonth] = useState(currentIsoMonth())

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

  const period = useMemo(() => monthBounds(isoMonth), [isoMonth])
  const periodLabel = formatMonthLabel(isoMonth)

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
        <div>
          <label htmlFor="report-month" className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("rapports.periodLabel")}</label>
          <input
            id="report-month"
            type="month"
            value={isoMonth}
            onChange={(e) => setIsoMonth(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <SimpleTabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      <div key={activeTab + isoMonth} className="animate-content-in mt-4">
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
