import { useEffect, useMemo, useState } from "react"
import { SimpleTabs } from "@/components/shared/SimpleTabs"
import { useStockStore } from "./stockStore"
import { StockInventoryTab } from "./StockInventoryTab"
import { StockMovementsTab } from "./StockMovementsTab"
import { StockAlertsTab } from "./StockAlertsTab"
import { computeCurrentStock, getStockStatus } from "@/lib/stockCalc"

export default function StocksPage() {
  const { articles, movements, fetchAll } = useStockStore()
  const [activeTab, setActiveTab] = useState("inventaire")

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const alertesCount = useMemo(
    () =>
      articles.filter((a) => {
        const status = getStockStatus(computeCurrentStock(a, movements), a.seuilCritique)
        return status === "critique" || status === "bas"
      }).length,
    [articles, movements]
  )

  const TABS = [
    { id: "inventaire", label: "Inventaire" },
    { id: "mouvements", label: "Mouvements" },
    { id: "alertes", label: "Alertes", badge: alertesCount },
  ]

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">Stocks</h2>
      <p className="mb-6 text-sm text-muted-foreground">Entrées, sorties et inventaire</p>

      <SimpleTabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      <div key={activeTab} className="animate-content-in mt-4">
        {activeTab === "inventaire" && <StockInventoryTab onGoToAlerts={() => setActiveTab("alertes")} />}
        {activeTab === "mouvements" && <StockMovementsTab />}
        {activeTab === "alertes" && <StockAlertsTab />}
      </div>
    </div>
  )
}