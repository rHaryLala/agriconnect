import { useEffect, useState } from "react"

const IMAGE_NAMES = [
  "hero-01", "hero-02", "hero-03", "hero-04",
  "hero-05", "hero-06", "hero-07", "hero-08",
  "hero-09", "hero-10", "hero-11", "hero-12",
]

const INTERVAL_MS = 5500

export function HeroSlideshow() {
  const [index, setIndex] = useState(0)
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0, 1 % IMAGE_NAMES.length]))
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
  }, [])

  useEffect(() => {
    if (reducedMotion) return

    let paused = document.hidden
    const onVisibility = () => {
      paused = document.hidden
    }
    document.addEventListener("visibilitychange", onVisibility)

    const timer = setInterval(() => {
      if (paused) return
      setIndex((i) => (i + 1) % IMAGE_NAMES.length)
    }, INTERVAL_MS)

    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [reducedMotion])

  useEffect(() => {
    setLoaded((prev) => {
      const next = (index + 1) % IMAGE_NAMES.length
      if (prev.has(index) && prev.has(next)) return prev
      const updated = new Set(prev)
      updated.add(index)
      updated.add(next)
      return updated
    })
  }, [index])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {IMAGE_NAMES.map((name, i) => {
        if (!loaded.has(i)) return null
        const active = i === index

        return (
          <picture key={name}>
            <source srcSet={`/hero/${name}.webp`} type="image/webp" />
            <img
              src={`/hero/${name}.jpg`}
              alt=""
              aria-hidden
              decoding="async"
              fetchPriority={i === 0 ? "high" : "auto"}
              className="absolute inset-0 h-full w-full object-cover motion-reduce:transition-none"
              style={{
                opacity: active ? 1 : 0,
                transform: active ? "scale(1.05)" : "scale(1)",
                transition: "opacity 1200ms ease-in-out, transform 8000ms ease-out",
              }}
            />
          </picture>
        )
      })}

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:bottom-6">
        {IMAGE_NAMES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Aller à l'image ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index ? "w-6 bg-white/90" : "w-1.5 bg-white/35 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  )
}