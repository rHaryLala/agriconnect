import { useEffect, useState } from "react"
import { SimpleTabs } from "@/components/shared/SimpleTabs"
import { useStockStore } from "./stockStore"
import { StockInventoryTab } from "./StockInventoryTab"
import { StockMovementsTab } from "./StockMovementsTab"
import { StockAlertsTab } from "./StockAlertsTab"

const TABS = [
  { id: "inventaire", label: "Inventaire" },
  { id: "mouvements", label: "Mouvements" },
  { id: "alertes", label: "Alertes" },
]

export default function StocksPage() {
  const fetchAll = useStockStore((s) => s.fetchAll)
  const [activeTab, setActiveTab] = useState("inventaire")

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

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