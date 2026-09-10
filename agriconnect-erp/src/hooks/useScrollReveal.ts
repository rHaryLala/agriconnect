import { useEffect, useRef, useState } from "react"

export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [reducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (reducedMotion) return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reducedMotion])

  return { ref, visible: visible || reducedMotion }
}