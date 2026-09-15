import { useEffect, useState } from "react"
import { prefersReducedMotion, watchMotionPreference } from "@/lib/motion"

const PIN_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)"

function pinAllowed(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia(PIN_QUERY).matches && !prefersReducedMotion()
}

export function usePinnedTrack(): boolean {
  const [pinned, setPinned] = useState(pinAllowed)

  useEffect(() => {
    const media = window.matchMedia(PIN_QUERY)
    const sync = () => setPinned(pinAllowed())

    media.addEventListener("change", sync)
    const stopWatching = watchMotionPreference(sync)

    return () => {
      media.removeEventListener("change", sync)
      stopWatching()
    }
  }, [])

  return pinned
}
