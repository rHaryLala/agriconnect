import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  User,
  ShieldCheck,
  Palette,
  Bell,
  Globe,
  Users,
  UserCog,
  SlidersHorizontal,
  DatabaseBackup,
  CircleCheck, 
  Check,
  type LucideIcon,
} from "lucide-react"
import { UsersManagement } from "./UsersManagement"
import { useAuthStore } from "@/features/auth/authStore"
import { useSettingsPanelStore } from "@/features/ui/settingsPanelStore"

type SettingsTab = {
  id: string
  labelKey: string
  icon: LucideIcon
  group: "account" | "administration" | "data"
}

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

const LANGUAGE_OPTIONS = [
  { code: "fr", flag: "🇫🇷" },
  { code: "en", flag: "🇬🇧" },
  { code: "mg", flag: "🇲🇬" },
] as const

function LanguageSettingsPanel() {
  const { t, i18n } = useTranslation()

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
      <div>
        <p className="mb-1 text-sm font-semibold text-foreground">{t("settings.language.sectionTitle")}</p>
        <p className="text-sm text-muted-foreground">{t("settings.language.sectionDescription")}</p>
      </div>

      <div className="max-w-xl rounded-2xl border border-border bg-surface p-2">
        <div className="flex flex-col gap-2">
          {LANGUAGE_OPTIONS.map(({ code, flag }) => {
            const isActive = i18n.language === code
            return (
              <button
                key={code}
                type="button"
                onClick={() => i18n.changeLanguage(code)}
                aria-pressed={isActive}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-200 ${
                  isActive ? "border-success bg-success/10" : "border-transparent hover:bg-background"
                }`}
              >
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${isActive ? "border-success" : "border-border"}`}>
                  {isActive && <span className="h-2 w-2 rounded-full bg-success" />}
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background text-base">{flag}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">{t(`language.${code}`)}</span>
                  <span className="block truncate text-xs text-muted-foreground">{t(`language.${code}Region`)}</span>
                </span>
                {isActive && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { t } = useTranslation()
  const role = useAuthStore((s) => s.user?.role)
  const [activeTab, setActiveTab] = useState<string>("profil")
  const [mobileView, setMobileView] = useState<"list" | "detail">("list")
  const collapsed = useSettingsPanelStore((s) => s.collapsed)
  const toggleCollapsed = useSettingsPanelStore((s) => s.toggle)

  const groups = ALL_GROUPS.filter((g) => g !== "administration" || role === "admin")
  const visibleTabs = TABS.filter((t) => groups.includes(t.group))
  const active = visibleTabs.find((t) => t.id === activeTab) ?? visibleTabs[0]

  function selectTab(id: string) {
    setActiveTab(id)
    setMobileView("detail")
  }

  function renderContent(tab: SettingsTab) {
    if (tab.id === "utilisateurs") {
      return <UsersManagement />
    }

    if (tab.id === "langue") {
      return <LanguageSettingsPanel />
    }

    return (
      <>
        <p className="mb-6 text-sm text-muted-foreground">
          {t("settings.placeholderDescription", { label: t(tab.labelKey) })}
        </p>
        <div className="rounded-xl border border-border bg-surface p-8 text-sm text-muted-foreground">
          {t("settings.placeholderContent", { label: t(tab.labelKey) })}
        </div>
      </>
    )
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">
      <aside
        className={`hidden shrink-0 transition-[width] duration-300 ease-in-out lg:block ${
          collapsed ? "w-14" : "w-64"
        }`}
      >
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? t("settings.expandPanel") : t("settings.collapsePanel")}
          aria-label={collapsed ? t("settings.expandPanel") : t("settings.collapsePanel")}
          className={`mb-3 flex h-8 items-center gap-2 rounded-md px-2 text-xs text-muted-foreground transition-colors duration-200 hover:bg-surface hover:text-foreground ${
            collapsed ? "w-full justify-center" : ""
          }`}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4" strokeWidth={1.75} />
              <span>{t("settings.collapsePanel")}</span>
            </>
          )}
        </button>

        {groups.map((group) => (
          <div key={group} className="mb-6">
            {!collapsed && (
              <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t(`settings.groups.${group}`)}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {TABS.filter((t) => t.group === group).map(({ id, labelKey, icon: Icon }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => selectTab(id)}
                    title={collapsed ? t(labelKey) : undefined}
                    aria-label={t(labelKey)}
                    className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors duration-200 ${
                      collapsed ? "justify-center" : ""
                    } ${
                      active.id === id
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-surface"
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

      {mobileView === "list" && (
        <div className="lg:hidden">
          {groups.map((group) => (
            <div key={group} className="mb-6">
              <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t(`settings.groups.${group}`)}
              </p>
              <ul className="overflow-hidden rounded-xl border border-border bg-surface">
                {TABS.filter((t) => t.group === group).map(({ id, labelKey, icon: Icon }, i, arr) => (
                  <li key={id} className={i < arr.length - 1 ? "border-b border-border" : ""}>
                    <button
                      type="button"
                      onClick={() => selectTab(id)}
                      className="flex min-h-[48px] w-full items-center gap-3 px-4 text-left text-sm text-foreground transition-colors duration-200 active:bg-background"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                      <span className="flex-1 truncate">{t(labelKey)}</span>
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
          <button
            type="button"
            onClick={() => setMobileView("list")}
            className="mb-4 flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-primary"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            {t("settings.back")}
          </button>
          <h2 className="mb-1 text-xl font-bold">{t(active.labelKey)}</h2>
          <p className="mb-1 text-sm text-muted-foreground">
            {t(`settings.groups.${active.group}`)} · {t("common.appName")}
          </p>
          <div key={active.id} className="animate-content-in mt-4">
            {renderContent(active)}
          </div>
        </div>
      )}

      <section key={active.id} className="hidden flex-1 animate-content-in lg:block">
        <h2 className="mb-1 text-2xl font-bold">{t(active.labelKey)}</h2>
        <p className="mb-1 text-sm text-muted-foreground">
          {t(`settings.groups.${active.group}`)} · {t("common.appName")}
        </p>
        <div className="mt-4">{renderContent(active)}</div>
      </section>
    </div>
  )
}