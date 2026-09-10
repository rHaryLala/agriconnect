import { useTranslation } from "react-i18next"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { useOfflineSyncStore } from "@/features/offline/offlineSyncStore"
import { useTheme } from "@/hooks/useTheme"

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true"

function storageFootprintKb(): number {
  let total = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith("agriconnect-")) continue
    total += (localStorage.getItem(key) ?? "").length
  }
  return Math.round((total / 1024) * 10) / 10
}

export function SystemStatusSection() {
  const { t, i18n } = useTranslation()
  const isOnline = useOnlineStatus()
  const pendingCount = useOfflineSyncStore((s) => s.pendingCount)
  const { theme } = useTheme()

  const items = [
    {
      label: t("settings.status.itemConnectivity"),
      detail: isOnline ? t("settings.status.online") : t("settings.status.offline"),
      ok: isOnline,
    },
    {
      label: t("settings.status.itemBackend"),
      detail: USE_MOCK_API ? t("settings.status.mockMode") : t("settings.status.realMode"),
      ok: true,
      warn: USE_MOCK_API,
    },
    {
      label: t("settings.status.itemSyncQueue"),
      detail: pendingCount > 0 ? t("settings.status.syncPending", { count: pendingCount }) : t("settings.status.syncUpToDate"),
      ok: pendingCount === 0,
    },
    {
      label: t("settings.status.itemStorage"),
      detail: `${storageFootprintKb()} KB`,
      ok: true,
    },
    {
      label: t("settings.status.itemLanguage"),
      detail: t(`language.${i18n.language}`),
      ok: true,
    },
    {
      label: t("settings.status.itemTheme"),
      detail: t(`settings.appearance.theme${theme === "dark" ? "Dark" : "Light"}`),
      ok: true,
    },
  ]

  return (
    <div className="rounded-xl border border-border bg-surface">
      {items.map((item, i) => (
        <div key={item.label} className={`flex items-center justify-between gap-4 px-6 py-4 ${i > 0 ? "border-t border-border" : ""}`}>
          <div className="flex items-center gap-3">
            {item.ok ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            ) : item.warn ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-destructive" />
            )}
            <p className="text-sm font-medium text-foreground">{item.label}</p>
          </div>
          <StatusBadge label={item.detail} tone={item.ok ? "success" : item.warn ? "warning" : "destructive"} />
        </div>
      ))}
    </div>
  )
}
