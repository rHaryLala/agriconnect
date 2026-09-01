import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { WifiOff } from "lucide-react"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"

export function OfflineBanner() {
  const { t } = useTranslation()
  const isOnline = useOnlineStatus()
  const wasOffline = useRef(false)

  useEffect(() => {
    if (isOnline && wasOffline.current) {
      toast.success(t("offline.backOnlineToast"))
    }
    wasOffline.current = !isOnline
  }, [isOnline, t])

  if (isOnline) return null

  return (
    <div
      role="status"
      className="glass-surface animate-content-in fixed inset-x-3 top-3 z-40 flex items-start gap-3 rounded-xl border-warning/30 bg-warning/10 px-4 py-3 shadow-lg sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2"
    >
      <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <div>
        <p className="text-sm font-semibold text-warning">{t("offline.bannerTitle")}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("offline.bannerDescription")}</p>
      </div>
    </div>
  )
}