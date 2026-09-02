import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Receipt } from "lucide-react"
import { SimpleTabs } from "@/components/shared/SimpleTabs"
import { ComingSoonPage } from "@/components/shared/ComingSoonPage"
import { ClientsListTab } from "./ClientsListTab"

export default function ClientsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("clients")

  const TABS = [
    { id: "clients", label: t("clients.tabs.clients") },
    { id: "factures", label: t("clients.tabs.invoices") },
  ]

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">{t("clients.pageTitle")}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{t("clients.pageSubtitle")}</p>

      <SimpleTabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      <div key={activeTab} className="animate-content-in mt-4">
        {activeTab === "clients" && <ClientsListTab />}
        {activeTab === "factures" && <ComingSoonPage icon={Receipt} title={t("clients.invoicesComingSoonTitle")} description={t("clients.invoicesComingSoonDescription")} />}
      </div>
    </div>
  )
}