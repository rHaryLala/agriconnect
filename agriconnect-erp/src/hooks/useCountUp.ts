import { useEffect, useState } from "react"

export function useCountUp(target: number, durationMs = 700): number {
  const [reducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (reducedMotion) return

    let start: number | null = null
    function step(timestamp: number) {
      if (start === null) start = timestamp
      const progress = Math.min((timestamp - start) / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    let frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs, reducedMotion])

  return reducedMotion ? target : value
}