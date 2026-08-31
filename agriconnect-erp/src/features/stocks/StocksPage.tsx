import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { SimpleTabs } from "@/components/shared/SimpleTabs"
import { useStockStore } from "./stockStore"
import { StockInventoryTab } from "./StockInventoryTab"
import { StockMovementsTab } from "./StockMovementsTab"
import { StockAlertsTab } from "./StockAlertsTab"

export default function StocksPage() {
  const { t } = useTranslation()
  const fetchAll = useStockStore((s) => s.fetchAll)
  const [activeTab, setActiveTab] = useState("inventaire")

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const TABS = [
    { id: "inventaire", label: t("stock.tabs.inventory") },
    { id: "mouvements", label: t("stock.tabs.movements") },
    { id: "alertes", label: t("stock.tabs.alerts") },
  ]

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">{t("stock.pageTitle")}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{t("stock.pageSubtitle")}</p>

      <SimpleTabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      <div key={activeTab} className="animate-content-in mt-4">
        {activeTab === "inventaire" && <StockInventoryTab onGoToAlerts={() => setActiveTab("alertes")} />}
        {activeTab === "mouvements" && <StockMovementsTab />}
        {activeTab === "alertes" && <StockAlertsTab />}
      </div>
    </div>
  )
}