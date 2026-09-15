import { useCallback, useEffect, useRef } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"
import { prefersReducedMotion, supportsHover, watchMotionPreference } from "@/lib/motion"

export function useTilt3D<T extends HTMLElement = HTMLDivElement>(maxDeg = 8) {
  const ref = useRef<T>(null)
  const rect = useRef<DOMRect | null>(null)
  const frame = useRef(0)
  const next = useRef({ px: 0.5, py: 0.5 })
  const enabled = useRef(false)

  useEffect(() => {
    function sync() {
      enabled.current = supportsHover() && !prefersReducedMotion()
    }
    sync()
    const stopWatching = watchMotionPreference(sync)
    return () => {
      stopWatching()
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [])

  const apply = useCallback(() => {
    frame.current = 0
    const el = ref.current
    if (!el) return
    const { px, py } = next.current
    el.style.setProperty("--tilt-x", `${(-(py - 0.5) * maxDeg * 2).toFixed(2)}deg`)
    el.style.setProperty("--tilt-y", `${((px - 0.5) * maxDeg * 2).toFixed(2)}deg`)
    el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`)
    el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`)
  }, [maxDeg])

  const onPointerEnter = useCallback(() => {
    const el = ref.current
    if (!el || !enabled.current) return
    rect.current = el.getBoundingClientRect()
    el.dataset.tilting = "true"
  }, [])

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<T>) => {
      const el = ref.current
      const bounds = rect.current
      if (!el || !bounds || !enabled.current) return
      next.current = {
        px: (event.clientX - bounds.left) / bounds.width,
        py: (event.clientY - bounds.top) / bounds.height,
      }
      if (!frame.current) frame.current = requestAnimationFrame(apply)
    },
    [apply],
  )

  const onPointerLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    rect.current = null
    delete el.dataset.tilting
    el.style.setProperty("--tilt-x", "0deg")
    el.style.setProperty("--tilt-y", "0deg")
  }, [])

  return { ref, handlers: { onPointerEnter, onPointerMove, onPointerLeave } }
}
