import { useCallback, useEffect } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { drainQueue, getPendingCount } from "@/lib/offlineQueue"
import { useOfflineSyncStore } from "./offlineSyncStore"

export function OfflineSyncManager() {
  const { t } = useTranslation()
  const isOnline = useOnlineStatus()
  const setPendingCount = useOfflineSyncStore((s) => s.setPendingCount)

  const refresh = useCallback(async () => {
    setPendingCount(await getPendingCount())
  }, [setPendingCount])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!isOnline) return
    let cancelled = false
    ;(async () => {
      const before = await getPendingCount()
      if (before === 0) return
      const { succeeded } = await drainQueue()
      if (cancelled) return
      if (succeeded > 0) toast.success(t("offline.syncSuccess", { count: succeeded }))
      refresh()
    })()
    return () => {
      cancelled = true
    }
  }, [isOnline, refresh, t])

  return null
}