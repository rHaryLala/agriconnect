import { useEffect, useRef } from "react"
import { prefersReducedMotion, watchMotionPreference } from "@/lib/motion"

interface Tracked {
  el: HTMLElement
  top: number
  height: number
}

const tracked = new Map<HTMLElement, Tracked>()
const visible = new Set<Tracked>()

let frame = 0
let listening = false
let observer: IntersectionObserver | null = null

function measure(item: Tracked) {
  const rect = item.el.getBoundingClientRect()
  item.top = rect.top + window.scrollY
  item.height = rect.height
}

function clamp01(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value
}

const PIN_LEAD = 0.08

function pinCurve(raw: number) {
  const t = clamp01((raw - PIN_LEAD) / (1 - PIN_LEAD * 2))
  return t * t * (3 - 2 * t)
}

function paint() {
  frame = 0
  const viewportHeight = window.innerHeight
  const scrollY = window.scrollY

  for (const item of visible) {
    const span = item.height + viewportHeight
    const raw = span === 0 ? 1 : (scrollY + viewportHeight - item.top) / span
    const p = clamp01(raw)
    item.el.style.setProperty("--p", p.toFixed(4))
    item.el.style.setProperty("--pc", (p * 2 - 1).toFixed(4))

    const pinSpan = item.height - viewportHeight
    const pinRaw = pinSpan <= 0 ? 0 : (scrollY - item.top) / pinSpan
    item.el.style.setProperty("--pin", pinCurve(clamp01(pinRaw)).toFixed(4))
  }
}

function requestPaint() {
  if (!frame) frame = requestAnimationFrame(paint)
}

function onResize() {
  for (const item of visible) measure(item)
  requestPaint()
}

function setListening(active: boolean) {
  if (active === listening) return
  listening = active
  if (active) {
    window.addEventListener("scroll", requestPaint, { passive: true })
    window.addEventListener("resize", onResize, { passive: true })
  } else {
    window.removeEventListener("scroll", requestPaint)
    window.removeEventListener("resize", onResize)
  }
}

function getObserver(): IntersectionObserver {
  if (observer) return observer
  observer = new IntersectionObserver(
    (records) => {
      for (const record of records) {
        const item = tracked.get(record.target as HTMLElement)
        if (!item) continue
        if (record.isIntersecting) {
          measure(item)
          visible.add(item)
        } else {
          visible.delete(item)
        }
      }
      setListening(visible.size > 0)
      if (visible.size > 0) requestPaint()
    },
    { rootMargin: "15% 0px" },
  )
  return observer
}

function register(el: HTMLElement) {
  if (tracked.has(el)) return
  const item: Tracked = { el, top: 0, height: 0 }
  tracked.set(el, item)
  measure(item)
  getObserver().observe(el)
}

function unregister(el: HTMLElement) {
  const item = tracked.get(el)
  if (!item) return
  observer?.unobserve(el)
  tracked.delete(el)
  visible.delete(item)
  setListening(visible.size > 0)
}

export function useScrollProgress<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let active = false

    function sync() {
      const next = enabled && !prefersReducedMotion()
      if (next === active) return
      active = next
      if (next) {
        register(el!)
      } else {
        unregister(el!)
        el!.style.setProperty("--p", "1")
        el!.style.setProperty("--pc", "0")
        el!.style.setProperty("--pin", "0")
      }
    }

    sync()
    const stopWatching = watchMotionPreference(sync)

    return () => {
      stopWatching()
      unregister(el)
    }
  }, [enabled])

  return ref
}
