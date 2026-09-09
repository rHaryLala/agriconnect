import { useState } from "react"
import { useTranslation } from "react-i18next"
import { SimpleTabs } from "@/components/shared/SimpleTabs"
import { ReadOnlyBanner } from "@/components/shared/ReadOnlyBanner"
import { usePermission } from "@/hooks/usePermission"
import { useAuthStore } from "@/features/auth/authStore"
import { ClientsListTab } from "./ClientsListTab"
import { InvoicesTab } from "./InvoicesTab"

export default function ClientsPage() {
  const { t } = useTranslation()
  const { canEdit } = usePermission("clients")
  const role = useAuthStore((s) => s.user?.role)
  const canEditClientRecords = role === "admin" || role === "comptable"
  const [activeTab, setActiveTab] = useState("clients")

  const TABS = [
    { id: "clients", label: t("clients.tabs.clients") },
    { id: "factures", label: t("clients.tabs.invoices") },
  ]

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">{t("clients.pageTitle")}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{t("clients.pageSubtitle")}</p>
      {!canEdit && <ReadOnlyBanner />}

      <SimpleTabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      <div key={activeTab} className="animate-content-in mt-4">
        {activeTab === "clients" && <ClientsListTab canEdit={canEditClientRecords} />}
        {activeTab === "factures" && <InvoicesTab canEdit={canEdit} />}
      </div>
    </div>
  )
}