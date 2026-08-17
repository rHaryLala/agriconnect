import { useState } from "react"
import { Plus } from "lucide-react"
import { SimpleTabs } from "@/components/shared/SimpleTabs"
import { AddTypeDialog } from "@/components/shared/AddTypeDialog"
import { PoulesPondeusesTab } from "./PoulesPondeusesTab"
import { VachesLaitieresTab } from "./VachesLaitieresTab"
import { PoulesKuroilerTab } from "./PoulesKuroilerTab"
import { AgricultureTab } from "./AgricultureTab"
import { CustomTypeTab } from "./CustomTypeTab"
import { useCustomTypesStore } from "./customTypesStore"

const FIXED_TABS = [
  { id: "poules", label: "Poules pondeuses" },
  { id: "vaches", label: "Vaches laitières" },
  { id: "kuroiler", label: "Poules Kuroiler" },
  { id: "agriculture", label: "Agriculture" },
]

export default function ProductionPage() {
  const customTypes = useCustomTypesStore((s) => s.types)
  const addCustomType = useCustomTypesStore((s) => s.addType)
  const [activeTab, setActiveTab] = useState("poules")
  const [addTypeOpen, setAddTypeOpen] = useState(false)

  const allTabs = [...FIXED_TABS, ...customTypes.map((t) => ({ id: t.id, label: t.label }))]
  const activeCustomType = customTypes.find((t) => t.id === activeTab)

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">Production</h2>
      <p className="mb-6 text-sm text-muted-foreground">Suivi quotidien des élevages et cultures</p>

      <SimpleTabs
        tabs={allTabs}
        activeId={activeTab}
        onChange={setActiveTab}
        trailing={
          <button
            type="button"
            onClick={() => setAddTypeOpen(true)}
            className="ml-1 flex items-center gap-1 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <Plus className="h-4 w-4" />
            Nouveau type
          </button>
        }
      />

      <div key={activeTab} className="animate-content-in mt-4">
        {activeTab === "poules" && <PoulesPondeusesTab />}
        {activeTab === "vaches" && <VachesLaitieresTab />}
        {activeTab === "kuroiler" && <PoulesKuroilerTab />}
        {activeTab === "agriculture" && <AgricultureTab />}
        {activeCustomType && <CustomTypeTab type={activeCustomType} />}
      </div>

      <AddTypeDialog
        open={addTypeOpen}
        onOpenChange={setAddTypeOpen}
        title="Nouveau type de production"
        fieldLabel="Nom du type"
        placeholder="Ex: Poules Label Rouge, Apiculture..."
        onSubmit={(label) => {
          addCustomType(label)
          const updated = useCustomTypesStore.getState().types
          const created = updated[updated.length - 1]
          if (created) setActiveTab(created.id)
        }}
      />
    </div>
  )
}