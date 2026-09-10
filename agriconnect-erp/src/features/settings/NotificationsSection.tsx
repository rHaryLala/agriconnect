import { useTranslation } from "react-i18next"
import { Switch } from "@/components/ui/switch"
import { useAuthStore } from "@/features/auth/authStore"
import { useSettingsPreferencesStore, type NotificationChannel, type NotificationKey } from "./settingsPreferencesStore"

const ROWS: { key: NotificationKey; adminOnly?: boolean }[] = [
  { key: "stockAlerts" },
  { key: "newTransactions" },
  { key: "pendingInvoices" },
  { key: "dailyReport" },
  { key: "unusualLogins" },
  { key: "newUsers", adminOnly: true },
  { key: "systemBackup", adminOnly: true },
]

export function NotificationsSection() {
  const { t } = useTranslation()
  const role = useAuthStore((s) => s.user?.role)
  const isAdmin = role === "admin"
  const { notifications, setNotificationPref } = useSettingsPreferencesStore()

  const rows = ROWS.filter((row) => !row.adminOnly || isAdmin)
  const channels: NotificationChannel[] = ["email", "push"]

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">{t("settings.notifications.colNotification")}</th>
              {channels.map((c) => (
                <th key={c} className="px-4 py-3 text-center">{t(`settings.notifications.channel${c === "email" ? "Email" : "Push"}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ key }) => (
              <tr key={key} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{t(`settings.notifications.${key}Title`)}</p>
                  <p className="text-xs text-muted-foreground">{t(`settings.notifications.${key}Description`)}</p>
                </td>
                {channels.map((channel) => (
                  <td key={channel} className="px-4 py-3 text-center">
                    <Switch
                      checked={notifications[key][channel]}
                      onCheckedChange={(checked) => setNotificationPref(key, channel, checked)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
