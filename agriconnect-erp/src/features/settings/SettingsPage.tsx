import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ChevronDown } from "lucide-react"
import { UsersManagement } from "./UsersManagement"
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher"
import { ReadOnlyBanner } from "@/components/shared/ReadOnlyBanner"
import { usePermission } from "@/hooks/usePermission"
import { User, ShieldCheck, Palette, Bell, Globe, Users, UserCog, SlidersHorizontal, DatabaseBackup, CircleCheck, type LucideIcon } from "lucide-react"

type SettingsTab = { id: string; labelKey: string; icon: LucideIcon; group: "account" | "administration" | "data" }

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

const ALL_GROUPS = ["account", "administration", "data"] as const

export default function SettingsPage() {
  const { t } = useTranslation()
  const { canView, canEdit } = usePermission("settings")
  const [activeTab, setActiveTab] = useState<string>("profil")
  const [openGroupMobile, setOpenGroupMobile] = useState<string>("account")

  const groups = ALL_GROUPS.filter((g) => g !== "administration" || canView)
  const visibleTabs = TABS.filter((tab) => groups.includes(tab.group))
  const active = visibleTabs.find((tab) => tab.id === activeTab) ?? visibleTabs[0]

  function selectTab(id: string, group: string) {
    setActiveTab(id)
    setOpenGroupMobile(group)
  }

  return (
    <div>
      {!canEdit && <ReadOnlyBanner />}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <aside className="hidden lg:block lg:w-64 lg:shrink-0">
          {groups.map((group) => (
            <div key={group} className="mb-6">
              <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t(`settings.groups.${group}`)}</p>
              <ul className="flex flex-col gap-0.5">
                {TABS.filter((tab) => tab.group === group).map(({ id, labelKey, icon: Icon }) => (
                  <li key={id}>
                    <button
                      type="button" onClick={() => selectTab(id, group)}
                      className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors duration-200 ${active.id === id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-surface"}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      {t(labelKey)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        <div className="flex flex-col gap-2 lg:hidden">
          {groups.map((group) => {
            const isOpen = openGroupMobile === group
            return (
              <div key={group} className="overflow-hidden rounded-xl border border-border bg-surface">
                <button type="button" onClick={() => setOpenGroupMobile(isOpen ? "" : group)} className="flex min-h-[44px] w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground" aria-expanded={isOpen}>
                  {t(`settings.groups.${group}`)}
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <ul className="flex flex-col gap-0.5 px-2 pb-2">
                      {TABS.filter((tab) => tab.group === group).map(({ id, labelKey, icon: Icon }) => (
                        <li key={id}>
                          <button
                            type="button" onClick={() => selectTab(id, group)}
                            className={`flex min-h-[44px] w-full items-center gap-2.5 rounded-md px-3 text-left text-sm transition-colors duration-200 ${active.id === id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-background"}`}
                          >
                            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                            {t(labelKey)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <section key={active.id} className="flex-1 animate-content-in">
          <h2 className="mb-1 text-2xl font-bold">{t(active.labelKey)}</h2>
          {active.id === "utilisateurs" ? (
            <UsersManagement canEdit={canEdit} />
          ) : active.id === "langue" ? (
            <div className="max-w-sm">
              <p className="mb-4 text-sm text-muted-foreground">{t("language.label")}</p>
              <LanguageSwitcher />
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-muted-foreground">{t("settings.placeholderDescription", { label: t(active.labelKey) })}</p>
              <div className="rounded-xl border border-border bg-surface p-8 text-sm text-muted-foreground">{t("settings.placeholderContent", { label: t(active.labelKey) })}</div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}