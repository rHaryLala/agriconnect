import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ShieldQuestion } from "lucide-react"
import { AlertBanner } from "@/components/shared/AlertBanner"
import { PERMISSIONS_MATRIX, type ModuleKey } from "@/lib/permissions"
import { ROLE_LABEL_KEYS } from "./roleLabels"
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

export function RolesPermissionsSection() {
  const { t } = useTranslation()
  const { users, fetchUsers } = useUsersStore()

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

        return (
          <div key={role} className="rounded-xl border border-border bg-surface p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{t(ROLE_LABEL_KEYS[role])}</p>
                <p className="text-xs text-muted-foreground">
                  {t("settings.roles.memberCount", { count: memberCount })} · {t("settings.roles.fullAccessCount", { count: fullCount })} · {t("settings.roles.readonlyAccessCount", { count: readonlyCount })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {MODULES.map((mod) => {
                const level = matrix[mod]
                const tone = level === "full" ? "bg-success/10 text-success" : level === "readonly" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                return (
                  <div key={mod} className={`rounded-lg px-2.5 py-2 text-xs ${tone}`}>
                    <p className="font-medium">{t(MODULE_LABEL_KEYS[mod])}</p>
                    <p className="opacity-80">{t(`settings.roles.level${level === "full" ? "Full" : level === "readonly" ? "Readonly" : "None"}`)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
