import { useState } from "react"
import {
  ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight,
  User, ShieldCheck, Palette, Bell, Globe,
  Users, UserCog, SlidersHorizontal, DatabaseBackup, CircleCheck,
  type LucideIcon,
} from "lucide-react"
import { UsersManagement } from "./UsersManagement"
import { useAuthStore } from "@/features/auth/authStore"
import { useSettingsPanelStore } from "@/features/ui/settingsPanelStore"

type SettingsTab = { id: string; label: string; icon: LucideIcon; group: "Compte" | "Administration" | "Données" }

const TABS: SettingsTab[] = [
  { id: "profil", label: "Profil", icon: User, group: "Compte" },
  { id: "securite", label: "Sécurité", icon: ShieldCheck, group: "Compte" },
  { id: "apparence", label: "Apparence", icon: Palette, group: "Compte" },
  { id: "notifications", label: "Notifications", icon: Bell, group: "Compte" },
  { id: "langue", label: "Langue & région", icon: Globe, group: "Compte" },
  { id: "utilisateurs", label: "Utilisateurs", icon: Users, group: "Administration" },
  { id: "roles", label: "Rôles & permissions", icon: UserCog, group: "Administration" },
  { id: "systeme", label: "Configuration système", icon: SlidersHorizontal, group: "Administration" },
  { id: "sauvegarde", label: "Sauvegarde", icon: DatabaseBackup, group: "Données" },
  { id: "statut", label: "Statut système", icon: CircleCheck, group: "Données" },
]

const ALL_GROUPS = ["Compte", "Administration", "Données"] as const

export default function SettingsPage() {
  const role = useAuthStore((s) => s.user?.role)
  const [activeTab, setActiveTab] = useState<string>("profil")
  const [mobileView, setMobileView] = useState<"list" | "detail">("list")
  const collapsed = useSettingsPanelStore((s) => s.collapsed)
  const toggleCollapsed = useSettingsPanelStore((s) => s.toggle)

  const groups = ALL_GROUPS.filter((g) => g !== "Administration" || role === "admin")
  const visibleTabs = TABS.filter((t) => groups.includes(t.group))
  const active = visibleTabs.find((t) => t.id === activeTab) ?? visibleTabs[0]

  function selectTab(id: string) {
    setActiveTab(id)
    setMobileView("detail")
  }

  function renderContent(tab: SettingsTab) {
    if (tab.id === "utilisateurs") return <UsersManagement />
    return (
      <>
        <p className="mb-6 text-sm text-muted-foreground">Section « {tab.label} » — contenu réel à brancher au sprint concerné.</p>
        <div className="rounded-xl border border-border bg-surface p-8 text-sm text-muted-foreground">
          Emplacement réservé pour le contenu de « {tab.label} ».
        </div>
      </>
    )
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">
      <aside className={`hidden shrink-0 transition-[width] duration-300 ease-in-out lg:block ${collapsed ? "w-14" : "w-64"}`}>
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? "Déplier le panneau" : "Réduire le panneau"}
          aria-label={collapsed ? "Déplier le panneau" : "Réduire le panneau"}
          className={`mb-3 flex h-8 items-center gap-2 rounded-md px-2 text-xs text-muted-foreground transition-colors duration-200 hover:bg-surface hover:text-foreground ${collapsed ? "w-full justify-center" : ""}`}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4" strokeWidth={1.75} />
              <span>Réduire</span>
            </>
          )}
        </button>

        {groups.map((group) => (
          <div key={group} className="mb-6">
            {!collapsed && <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{group}</p>}
            <ul className="flex flex-col gap-0.5">
              {TABS.filter((t) => t.group === group).map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => selectTab(id)}
                    title={collapsed ? label : undefined}
                    aria-label={label}
                    className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors duration-200 ${collapsed ? "justify-center" : ""} ${
                      active.id === id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-surface"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    {!collapsed && label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      {mobileView === "list" && (
        <div className="lg:hidden">
          {groups.map((group) => (
            <div key={group} className="mb-6">
              <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{group}</p>
              <ul className="overflow-hidden rounded-xl border border-border bg-surface">
                {TABS.filter((t) => t.group === group).map(({ id, label, icon: Icon }, i, arr) => (
                  <li key={id} className={i < arr.length - 1 ? "border-b border-border" : ""}>
                    <button
                      type="button"
                      onClick={() => selectTab(id)}
                      className="flex min-h-[48px] w-full items-center gap-3 px-4 text-left text-sm text-foreground transition-colors duration-200 active:bg-background"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                      <span className="flex-1 truncate">{label}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {mobileView === "detail" && (
        <div className="lg:hidden">
          <button type="button" onClick={() => setMobileView("list")} className="mb-4 flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-primary">
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            Paramètres
          </button>
          <h2 className="mb-1 text-xl font-bold">{active.label}</h2>
          <div key={active.id} className="animate-content-in mt-4">
            {renderContent(active)}
          </div>
        </div>
      )}

      <section key={active.id} className="hidden flex-1 animate-content-in lg:block">
        <h2 className="mb-1 text-2xl font-bold">{active.label}</h2>
        <div className="mt-4">{renderContent(active)}</div>
      </section>
    </div>
  )
}