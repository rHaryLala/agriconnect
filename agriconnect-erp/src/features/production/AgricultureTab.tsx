import { useState } from "react"
import { useTranslation } from "react-i18next"
import { SimpleTabs } from "@/components/shared/SimpleTabs"
import { CulturesTab } from "./CulturesTab"
import { MainOeuvreTab } from "./MainOeuvreTab"

export function AgricultureTab({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation()
  const [subTab, setSubTab] = useState("cultures")

  const SUB_TABS = [
    { id: "cultures", label: t("production.agriculture.subTabCultures") },
    { id: "mainOeuvre", label: t("production.agriculture.subTabLabour") },
  ]

  return (
    <div>
      <SimpleTabs tabs={SUB_TABS} activeId={subTab} onChange={setSubTab} />

      <div key={subTab} className="animate-content-in mt-4">
        {subTab === "cultures" && <CulturesTab canEdit={canEdit} />}
        {subTab === "mainOeuvre" && <MainOeuvreTab canEdit={canEdit} />}
      </div>
    </div>
  )
}
