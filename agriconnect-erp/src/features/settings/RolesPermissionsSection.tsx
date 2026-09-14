import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ChevronDown, ShieldQuestion, Check, Minus } from "lucide-react"
import { AlertBanner } from "@/components/shared/AlertBanner"
import {
  MODULE_KEYS,
  PERMISSION_ACTIONS,
  hasPermission,
  permissionsForRole,
} from "@/lib/permissions"
import { ROLE_LABEL_KEYS, ROLE_ICONS, ROLE_ACCENTS } from "./roleLabels"
import { ACTION_LABEL_KEYS, MODULE_LABEL_KEYS } from "./permissionLabels"
import { useUsersStore } from "./usersStore"
import type { UserRole } from "@/types/user"

const ROLES: UserRole[] = ["admin", "comptable", "ouvrier", "magasinier", "controleur_interne"]

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
        const permissions = permissionsForRole(role)
        const memberCount = users.filter((u) => u.role === role).length
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
                    {t("settings.roles.grantedCount", { count: permissions.length })}
                  </span>
                </span>
              </span>

              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <div className="overflow-x-auto border-t border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground">
                        <th scope="col" className="px-4 py-2 text-left font-medium">
                          {t("settings.roles.colModule")}
                        </th>
                        {PERMISSION_ACTIONS.map((action) => (
                          <th key={action} scope="col" className="px-3 py-2 text-center font-medium">
                            {t(ACTION_LABEL_KEYS[action])}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {MODULE_KEYS.map((mod) => (
                        <tr key={mod}>
                          <th scope="row" className="px-4 py-2.5 text-left font-normal text-foreground">
                            {t(MODULE_LABEL_KEYS[mod])}
                          </th>
                          {PERMISSION_ACTIONS.map((action) => {
                            const granted = hasPermission(permissions, mod, action)
                            return (
                              <td key={action} className="px-3 py-2.5 text-center">
                                <span
                                  aria-label={granted ? t("settings.roles.granted") : t("settings.roles.notGranted")}
                                  className={`inline-flex h-5 w-5 items-center justify-center rounded ${granted ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                                >
                                  {granted ? <Check className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                                </span>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
