import { useState } from "react"
import { useTranslation } from "react-i18next"
import { SimpleTabs } from "@/components/shared/SimpleTabs"
import { ReadOnlyBanner } from "@/components/shared/ReadOnlyBanner"
import { EmployesTab } from "./EmployesTab"
import { RetenuesTab } from "./RetenuesTab"
import { usePermission } from "@/hooks/usePermission"

export default function PersonnelPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("employes")
  const { canEdit } = usePermission("personnel")

  const TABS = [
    { id: "employes", label: t("personnel.tabsStaff") },
    { id: "retenues", label: t("personnel.tabsDeductions") },
  ]

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">{t("personnel.pageTitle")}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{t("personnel.pageSubtitle")}</p>

      {!canEdit && <ReadOnlyBanner />}
      <SimpleTabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      <div key={activeTab} className="animate-content-in mt-4">
        {activeTab === "employes" && <EmployesTab canEdit={canEdit} />}
        {activeTab === "retenues" && <RetenuesTab />}
      </div>
    </div>
  )
}
