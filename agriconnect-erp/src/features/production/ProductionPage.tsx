import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Plus, Settings2 } from "lucide-react"
import { SimpleTabs } from "@/components/shared/SimpleTabs"
import { AddTypeDialog } from "@/components/shared/AddTypeDialog"
import { TypesManagerDialog } from "@/components/shared/TypesManagerDialog"
import { ProductionOverviewTab } from "./ProductionOverviewTab"
import { PoulesPondeusesTab } from "./PoulesPondeusesTab"
import { VachesLaitieresTab } from "./VachesLaitieresTab"
import { PoulesKuroilerTab } from "./PoulesKuroilerTab"
import { AgricultureTab } from "./AgricultureTab"
import { CustomTypeTab } from "./CustomTypeTab"
import { useCustomTypesStore } from "./customTypesStore"

export default function ProductionPage() {
  const { t } = useTranslation()
  const customTypes = useCustomTypesStore((s) => s.types)
  const addCustomType = useCustomTypesStore((s) => s.addType)
  const updateCustomType = useCustomTypesStore((s) => s.updateType)
  const removeCustomType = useCustomTypesStore((s) => s.removeType)
  const [activeTab, setActiveTab] = useState("apercu")
  const [addTypeOpen, setAddTypeOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)

  const FIXED_TABS = [
    { id: "apercu", label: t("production.tabs.overview") },
    { id: "poules", label: t("production.tabs.poules") },
    { id: "vaches", label: t("production.tabs.vaches") },
    { id: "kuroiler", label: t("production.tabs.kuroiler") },
    { id: "agriculture", label: t("production.tabs.agriculture") },
  ]
  const allTabs = [...FIXED_TABS, ...customTypes.map((t) => ({ id: t.id, label: t.label }))]
  const activeCustomType = customTypes.find((t) => t.id === activeTab)

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">{t("production.pageTitle")}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{t("production.pageSubtitle")}</p>

      <SimpleTabs
        tabs={allTabs}
        activeId={activeTab}
        onChange={setActiveTab}
        trailing={
          <div className="ml-1 flex items-center gap-1">
            <button type="button" onClick={() => setAddTypeOpen(true)} className="flex items-center gap-1 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-primary">
              <Plus className="h-4 w-4" />
              {t("production.tabs.newType")}
            </button>
            {customTypes.length > 0 && (
              <button type="button" onClick={() => setManageOpen(true)} aria-label={t("production.addTypeDialog.manageCustomTypesTitle")} className="flex items-center gap-1 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-primary">
                <Settings2 className="h-4 w-4" />
              </button>
            )}
          </div>
        }
      />

      <div key={activeTab} className="animate-content-in mt-4">
        {activeTab === "apercu" && <ProductionOverviewTab onGoToTab={setActiveTab} />}
        {activeTab === "poules" && <PoulesPondeusesTab />}
        {activeTab === "vaches" && <VachesLaitieresTab />}
        {activeTab === "kuroiler" && <PoulesKuroilerTab />}
        {activeTab === "agriculture" && <AgricultureTab />}
        {activeCustomType && <CustomTypeTab type={activeCustomType} />}
      </div>

      <AddTypeDialog
        open={addTypeOpen}
        onOpenChange={setAddTypeOpen}
        title={t("production.addTypeDialog.titleProduction")}
        fieldLabel={t("production.addTypeDialog.fieldLabel")}
        placeholder={t("production.addTypeDialog.placeholderProduction")}
        onSubmit={(label) => {
          addCustomType(label)
          const updated = useCustomTypesStore.getState().types
          const created = updated[updated.length - 1]
          if (created) setActiveTab(created.id)
        }}
      />

      <TypesManagerDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        title={t("production.addTypeDialog.manageCustomTypesTitle")}
        fields={[{ name: "label", label: t("production.addTypeDialog.fieldLabel"), type: "text" }]}
        items={customTypes}
        onAdd={() => {}}
        onUpdate={(id, v) => updateCustomType(id, v.label as string)}
        onDelete={(id) => {
          removeCustomType(id)
          if (activeTab === id) setActiveTab("apercu")
        }}
      />
    </div>
  )
}