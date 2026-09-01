import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"

export function OfflineStatusWatcher() {
  const { t } = useTranslation()
  const isOnline = useOnlineStatus()
  const hasMounted = useRef(false)
  const wasOffline = useRef(!isOnline)

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      wasOffline.current = !isOnline
      return
    }

    if (!isOnline) {
      toast.warning(t("offline.bannerTitle"), { description: t("offline.bannerDescription") })
    } else if (wasOffline.current) {
      toast.success(t("offline.backOnlineToast"))
    }

    wasOffline.current = !isOnline
  }, [isOnline, t])

  return null
}