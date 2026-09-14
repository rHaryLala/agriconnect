import { useState } from "react"
import { useTranslation } from "react-i18next"
import { SimpleTabs } from "@/components/shared/SimpleTabs"
import { CulturesTab } from "./CulturesTab"
import { MainOeuvreTab } from "./MainOeuvreTab"
import { EngraisTab } from "./EngraisTab"

export function AgricultureTab({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation()
  const [subTab, setSubTab] = useState("cultures")

  const SUB_TABS = [
    { id: "cultures", label: t("production.agriculture.subTabCultures") },
    { id: "mainOeuvre", label: t("production.agriculture.subTabLabour") },
    { id: "engrais", label: t("production.agriculture.subTabFertilizer") },
  ]

  return (
    <div>
      <SimpleTabs tabs={SUB_TABS} activeId={subTab} onChange={setSubTab} />

      <div key={subTab} className="animate-content-in mt-4">
        {subTab === "cultures" && <CulturesTab canEdit={canEdit} />}
        {subTab === "mainOeuvre" && <MainOeuvreTab canEdit={canEdit} />}
        {subTab === "engrais" && <EngraisTab canEdit={canEdit} />}
      </div>
    </div>
  )
}
