import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ChevronDown, ShieldQuestion, Check, Eye, Minus } from "lucide-react"
import { AlertBanner } from "@/components/shared/AlertBanner"
import { PERMISSIONS_MATRIX, type ModuleKey, type PermissionLevel } from "@/lib/permissions"
import { ROLE_LABEL_KEYS, ROLE_ICONS, ROLE_ACCENTS } from "./roleLabels"
import { useUsersStore } from "./usersStore"
import type { UserRole } from "@/types/user"

const ROLES: UserRole[] = ["admin", "comptable", "ouvrier", "magasinier", "controleur_interne"]
const MODULES: ModuleKey[] = ["dashboard", "production", "stock", "finance", "clients", "settings"]
const MODULE_LABEL_KEYS: Record<ModuleKey, string> = {
  dashboard: "nav.dashboard",
  production: "nav.production",
  stock: "nav.stocks",
  finance: "nav.finance",
  clients: "nav.clients",
  settings: "nav.settings",
}

const LEVEL_STYLES: Record<PermissionLevel, { chip: string; icon: typeof Check; labelKey: string }> = {
  full: { chip: "bg-success/10 text-success ring-success/20", icon: Check, labelKey: "settings.roles.levelFull" },
  readonly: { chip: "bg-warning/10 text-warning ring-warning/20", icon: Eye, labelKey: "settings.roles.levelReadonly" },
  none: { chip: "bg-muted text-muted-foreground ring-border", icon: Minus, labelKey: "settings.roles.levelNone" },
}

export function RolesPermissionsSection() {
  const { t } = useTranslation()
  const { users, fetchUsers } = useUsersStore()
  const [expanded, setExpanded] = useState<UserRole | null>("admin")

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <div className="flex flex-col gap-4">
      <AlertBanner tone="info" icon={ShieldQuestion} title={t("settings.roles.infoBanner")} />

      {ROLES.map((role) => {
        const matrix = PERMISSIONS_MATRIX[role]
        const memberCount = users.filter((u) => u.role === role).length
        const fullCount = MODULES.filter((m) => matrix[m] === "full").length
        const readonlyCount = MODULES.filter((m) => matrix[m] === "readonly").length
        const RoleIcon = ROLE_ICONS[role]
        const isOpen = expanded === role

        return (
          <div key={role} className="overflow-hidden rounded-xl border border-border bg-surface">
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : role)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-background"
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ROLE_ACCENTS[role]}`}>
                <RoleIcon className="h-5 w-5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{t(ROLE_LABEL_KEYS[role])}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{t("settings.roles.memberCount", { count: memberCount })}</span>
                  <span className="flex items-center gap-1 text-success">
                    <Check className="h-3 w-3" />
                    {t("settings.roles.fullAccessCount", { count: fullCount })}
                  </span>
                  <span className="flex items-center gap-1 text-warning">
                    <Eye className="h-3 w-3" />
                    {t("settings.roles.readonlyAccessCount", { count: readonlyCount })}
                  </span>
                </span>
              </span>

              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <ul className="flex flex-col divide-y divide-border border-t border-border">
                  {MODULES.map((mod) => {
                    const level = matrix[mod]
                    const style = LEVEL_STYLES[level]
                    const LevelIcon = style.icon
                    return (
                      <li key={mod} className="flex items-center justify-between gap-4 px-4 py-2.5">
                        <span className="text-sm text-foreground">{t(MODULE_LABEL_KEYS[mod])}</span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${style.chip}`}>
                          <LevelIcon className="h-3 w-3" />
                          {t(style.labelKey)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
