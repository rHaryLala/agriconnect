import { useState } from "react"
import { useTranslation } from "react-i18next"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AlertBanner } from "@/components/shared/AlertBanner"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { useOfflineSyncStore } from "@/features/offline/offlineSyncStore"
import { useTheme } from "@/hooks/useTheme"
import { useRegionStore, REGIONS } from "./regionStore"
import { useSettingsPreferencesStore } from "./settingsPreferencesStore"
import { formatDateTime } from "@/lib/format"

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

function storageBlockCount(): number {
  let count = 0
  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i)?.startsWith("agriconnect-")) count++
  }
  return count
}

type ServiceState = "ok" | "warn" | "down"

export function SystemStatusSection() {
  const { t, i18n } = useTranslation()
  const isOnline = useOnlineStatus()
  const pendingCount = useOfflineSyncStore((s) => s.pendingCount)
  const { theme } = useTheme()
  const region = useRegionStore((s) => s.region)
  const maintenanceMode = useSettingsPreferencesStore((s) => s.systemBehavior.maintenanceMode)
  const [checkedAt, setCheckedAt] = useState(() => new Date().toISOString())
  const [footprint, setFootprint] = useState(storageFootprintKb)
  const [blocks, setBlocks] = useState(storageBlockCount)

  function refresh() {
    setFootprint(storageFootprintKb())
    setBlocks(storageBlockCount())
    setCheckedAt(new Date().toISOString())
  }

  const services: { key: string; label: string; detail: string; state: ServiceState; badge: string }[] = [
    {
      key: "connectivity",
      label: t("settings.status.itemConnectivity"),
      detail: t("settings.status.connectivityDetail"),
      state: isOnline ? "ok" : "down",
      badge: isOnline ? t("settings.status.online") : t("settings.status.offline"),
    },
    {
      key: "backend",
      label: t("settings.status.itemBackend"),
      detail: USE_MOCK_API ? t("settings.status.backendDetailMock") : t("settings.status.backendDetailReal"),
      state: USE_MOCK_API ? "warn" : "ok",
      badge: USE_MOCK_API ? t("settings.status.mockMode") : t("settings.status.realMode"),
    },
    {
      key: "sync",
      label: t("settings.status.itemSyncQueue"),
      detail: t("settings.status.syncDetail"),
      state: pendingCount === 0 ? "ok" : "warn",
      badge: pendingCount > 0 ? t("settings.status.syncPending", { count: pendingCount }) : t("settings.status.syncUpToDate"),
    },
    {
      key: "storage",
      label: t("settings.status.itemStorage"),
      detail: t("settings.status.storageDetail", { count: blocks }),
      state: "ok",
      badge: `${footprint} KB`,
    },
    {
      key: "maintenance",
      label: t("settings.status.itemMaintenance"),
      detail: t("settings.status.maintenanceDetail"),
      state: maintenanceMode ? "warn" : "ok",
      badge: maintenanceMode ? t("settings.status.maintenanceOn") : t("settings.status.maintenanceOff"),
    },
  ]

  const anomalies = services.filter((s) => s.state !== "ok")

  const infoCards = [
    { label: t("settings.status.cardEnvironment"), value: import.meta.env.DEV ? t("settings.status.envDev") : t("settings.status.envProd") },
    { label: t("settings.status.cardDataSource"), value: USE_MOCK_API ? t("settings.status.mockMode") : t("settings.status.realMode") },
    { label: t("settings.status.cardRegion"), value: `${t(`settings.language.region${region}`)} — ${REGIONS[region].timezone}` },
    { label: t("settings.status.cardLanguage"), value: t(`language.${i18n.language}`) },
    { label: t("settings.status.cardTheme"), value: t(`settings.appearance.theme${theme === "dark" ? "Dark" : "Light"}`) },
    { label: t("settings.status.cardLastCheck"), value: formatDateTime(checkedAt) },
  ]

  const DOT_STYLES: Record<ServiceState, string> = {
    ok: "bg-success",
    warn: "bg-warning",
    down: "bg-destructive",
  }
  const BADGE_TONES: Record<ServiceState, "success" | "warning" | "destructive"> = {
    ok: "success",
    warn: "warning",
    down: "destructive",
  }

  return (
    <div className="flex flex-col gap-6">
      <AlertBanner
        tone={anomalies.length > 0 ? "warning" : "info"}
        title={anomalies.length > 0 ? t("settings.status.bannerAnomalies", { count: anomalies.length }) : t("settings.status.bannerAllGood")}
        description={t("settings.status.bannerLastCheck", { time: formatDateTime(checkedAt) })}
        action={{ label: t("settings.status.refresh"), onClick: refresh }}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {services.map((service, i) => (
          <div key={service.key} className={`flex items-center justify-between gap-4 px-6 py-4 ${i > 0 ? "border-t border-border" : ""}`}>
            <div className="flex min-w-0 items-center gap-3">
              <span aria-hidden className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT_STYLES[service.state]}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{service.label}</p>
                <p className="truncate text-xs text-muted-foreground">{service.detail}</p>
              </div>
            </div>
            <StatusBadge label={service.badge} tone={BADGE_TONES[service.state]} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {infoCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-sm font-medium text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={refresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t("settings.status.refresh")}
        </Button>
      </div>
    </div>
  )
}
