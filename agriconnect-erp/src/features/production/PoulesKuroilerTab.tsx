import { useState } from "react"
import { useTranslation } from "react-i18next"
import { SimpleTabs } from "@/components/shared/SimpleTabs"
import { KuroilerProductionTab } from "./KuroilerProductionTab"
import { KuroilerRegistryTab } from "./KuroilerRegistryTab"
import { KuroilerEggsTab } from "./KuroilerEggsTab"

export function PoulesKuroilerTab({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation()
  const [subTab, setSubTab] = useState("production")

  const SUB_TABS = [
    { id: "production", label: t("production.kuroiler.subTabProduction") },
    { id: "registre", label: t("production.kuroiler.subTabRegistry") },
    { id: "oeufs", label: t("production.kuroiler.subTabEggs") },
  ]

  return (
    <div>
      <SimpleTabs tabs={SUB_TABS} activeId={subTab} onChange={setSubTab} />

      <div key={subTab} className="animate-content-in mt-4">
        {subTab === "production" && <KuroilerProductionTab canEdit={canEdit} />}
        {subTab === "registre" && <KuroilerRegistryTab canEdit={canEdit} />}
        {subTab === "oeufs" && <KuroilerEggsTab canEdit={canEdit} />}
      </div>
    </div>
  )
}
