import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { UsersManagement } from "./UsersManagement"
import { ProfileSection } from "./ProfileSection"
import { SecuritySection } from "./SecuritySection"
import { AppearanceSection } from "./AppearanceSection"
import { NotificationsSection } from "./NotificationsSection"
import { LanguageRegionSection } from "./LanguageRegionSection"
import { RolesPermissionsSection } from "./RolesPermissionsSection"
import { SystemConfigSection } from "./SystemConfigSection"
import { BackupSection } from "./BackupSection"
import { SystemStatusSection } from "./SystemStatusSection"
import { ReadOnlyBanner } from "@/components/shared/ReadOnlyBanner"
import { Button } from "@/components/ui/button"
import { usePermission } from "@/hooks/usePermission"
import { useSettingsPanelStore } from "@/features/ui/settingsPanelStore"
import { User, ShieldCheck, Palette, Bell, Globe, Users, UserCog, SlidersHorizontal, DatabaseBackup, CircleCheck, type LucideIcon } from "lucide-react"

type SettingsGroup = "account" | "administration" | "data"
type SettingsTab = { id: string; labelKey: string; icon: LucideIcon; group: SettingsGroup }

const TABS: SettingsTab[] = [
  { id: "profil", labelKey: "settings.tabs.profile", icon: User, group: "account" },
  { id: "securite", labelKey: "settings.tabs.security", icon: ShieldCheck, group: "account" },
  { id: "apparence", labelKey: "settings.tabs.appearance", icon: Palette, group: "account" },
  { id: "notifications", labelKey: "settings.tabs.notifications", icon: Bell, group: "account" },
  { id: "langue", labelKey: "settings.tabs.language", icon: Globe, group: "account" },
  { id: "utilisateurs", labelKey: "settings.tabs.users", icon: Users, group: "administration" },
  { id: "roles", labelKey: "settings.tabs.roles", icon: UserCog, group: "administration" },
  { id: "systeme", labelKey: "settings.tabs.system", icon: SlidersHorizontal, group: "administration" },
  { id: "sauvegarde", labelKey: "settings.tabs.backup", icon: DatabaseBackup, group: "data" },
  { id: "statut", labelKey: "settings.tabs.status", icon: CircleCheck, group: "data" },
]

const ALL_GROUPS: SettingsGroup[] = ["account", "administration", "data"]

export default function SettingsPage() {
  const { t } = useTranslation()
  const { canView, canEdit } = usePermission("settings")
  const { collapsed, toggle } = useSettingsPanelStore()
  const [activeTab, setActiveTab] = useState<string>("profil")
  // Mobile follows the native phone-settings pattern: the list is the screen,
  // picking an entry pushes its detail view over it.
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)

  // "administration" and "data" both hold sensitive/technical sections, so both require
  // settings access beyond "none" — only "account" stays open to every signed-in user.
  const groups = ALL_GROUPS.filter((g) => g === "account" || canView)
  const visibleTabs = TABS.filter((tab) => groups.includes(tab.group))
  const active = visibleTabs.find((tab) => tab.id === activeTab) ?? visibleTabs[0]

  function selectTab(id: string) {
    setActiveTab(id)
    setMobileDetailOpen(true)
  }

  function renderSection() {
    switch (active.id) {
      case "profil": return <ProfileSection />
      case "securite": return <SecuritySection />
      case "apparence": return <AppearanceSection />
      case "notifications": return <NotificationsSection />
      case "langue": return <LanguageRegionSection />
      case "utilisateurs": return <UsersManagement canEdit={canEdit} />
      case "roles": return <RolesPermissionsSection />
      case "systeme": return <SystemConfigSection canEdit={canEdit} />
      case "sauvegarde": return <BackupSection canEdit={canEdit} />
      case "statut": return <SystemStatusSection />
      default: return null
    }
  }

  return (
    <div>
      {!canEdit && <ReadOnlyBanner />}

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Desktop: collapsible sidebar */}
        <aside className={`hidden shrink-0 lg:block ${collapsed ? "lg:w-16" : "lg:w-64"} transition-[width] duration-300`}>
          <div className={`mb-4 flex ${collapsed ? "justify-center" : "justify-end"}`}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label={collapsed ? t("settings.expandPanel") : t("settings.collapsePanel")}
              title={collapsed ? t("settings.expandPanel") : t("settings.collapsePanel")}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>

          {groups.map((group) => (
            <div key={group} className="mb-6">
              {!collapsed && (
                <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t(`settings.groups.${group}`)}</p>
              )}
              <ul className="flex flex-col gap-0.5">
                {TABS.filter((tab) => tab.group === group).map(({ id, labelKey, icon: Icon }) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(id)}
                      title={collapsed ? t(labelKey) : undefined}
                      aria-label={collapsed ? t(labelKey) : undefined}
                      className={`flex w-full items-center gap-2.5 rounded-md py-2 text-left text-sm transition-colors duration-200 ${collapsed ? "justify-center px-0" : "px-3"} ${
                        active.id === id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-surface"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      {!collapsed && t(labelKey)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        {/* Mobile / tablet: native-style master list, then detail with a back button */}
        <div className="lg:hidden">
          {!mobileDetailOpen ? (
            <div className="animate-content-in flex flex-col gap-5">
              <h2 className="text-2xl font-bold">{t("nav.settings")}</h2>
              {groups.map((group) => (
                <div key={group}>
                  <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t(`settings.groups.${group}`)}</p>
                  <ul className="overflow-hidden rounded-xl border border-border bg-surface">
                    {TABS.filter((tab) => tab.group === group).map(({ id, labelKey, icon: Icon }, i) => (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => selectTab(id)}
                          className={`flex min-h-[52px] w-full items-center gap-3 px-4 text-left text-sm text-foreground transition-colors active:bg-background ${i > 0 ? "border-t border-border" : ""}`}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                          <span className="flex-1">{t(labelKey)}</span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div key={active.id} className="animate-content-in">
              <button
                type="button"
                onClick={() => setMobileDetailOpen(false)}
                className="mb-3 -ml-2 flex min-h-[44px] items-center gap-1 rounded-md px-2 text-sm font-medium text-primary"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("settings.back")}
              </button>
              <h2 className="mb-6 text-2xl font-bold">{t(active.labelKey)}</h2>
              {renderSection()}
            </div>
          )}
        </div>

        {/* Desktop content */}
        <section key={active.id} className="animate-content-in hidden min-w-0 flex-1 lg:block">
          <h2 className="mb-6 text-2xl font-bold">{t(active.labelKey)}</h2>
          {renderSection()}
        </section>
      </div>
    </div>
  )
}
