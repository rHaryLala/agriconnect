import { useTranslation } from "react-i18next"
import { MODULE_KEYS, PERMISSION_ACTIONS, hasPermission, permission, type Permission } from "@/lib/permissions"
import { ACTION_LABEL_KEYS, MODULE_LABEL_KEYS } from "./permissionLabels"

interface PermissionChecklistProps {
  permissions: Permission[]
  disabled?: boolean
  onChange: (permissions: Permission[]) => void
}

/** Module x action grid of checkboxes, used to tailor an account's rights. */
export function PermissionChecklist({ permissions, disabled = false, onChange }: PermissionChecklistProps) {
  const { t } = useTranslation()

  function toggle(next: Permission, granted: boolean) {
    onChange(granted ? [...permissions, next] : permissions.filter((p) => p !== next))
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-background text-xs text-muted-foreground">
            <th scope="col" className="px-3 py-2 text-left font-medium">
              {t("settings.roles.colModule")}
            </th>
            {PERMISSION_ACTIONS.map((action) => (
              <th key={action} scope="col" className="px-2 py-2 text-center font-medium">
                {t(ACTION_LABEL_KEYS[action])}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {MODULE_KEYS.map((module) => (
            <tr key={module}>
              <th scope="row" className="px-3 py-2 text-left font-normal text-foreground">
                {t(MODULE_LABEL_KEYS[module])}
              </th>
              {PERMISSION_ACTIONS.map((action) => {
                const value = permission(module, action)
                const granted = hasPermission(permissions, module, action)
                return (
                  <td key={action} className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={granted}
                      disabled={disabled}
                      onChange={(e) => toggle(value, e.target.checked)}
                      aria-label={`${t(MODULE_LABEL_KEYS[module])} — ${t(ACTION_LABEL_KEYS[action])}`}
                      className="h-4 w-4 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
