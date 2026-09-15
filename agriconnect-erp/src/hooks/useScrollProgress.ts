import { useEffect, useRef } from "react"
import { prefersReducedMotion, watchMotionPreference } from "@/lib/motion"

/**
 * Publie l'avancée d'un élément dans le viewport sous forme de variables CSS,
 * que les feuilles de style consomment pour le parallaxe et les rotations 3D.
 *
 *   --p   0 quand le haut de l'élément touche le bas de l'écran, 1 quand son
 *         bas touche le haut de l'écran.
 *   --pc  le même signal recentré sur [-1, 1], 0 au milieu de la traversée.
 *
 * Le coût est tenu par trois choix : un seul écouteur de scroll pour toute la
 * page, une seule frame d'animation qui met à jour tous les éléments suivis, et
 * des mesures mises en cache — aucune lecture de géométrie pendant le défilement,
 * donc aucun calcul de mise en page forcé.
 */
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

function paint() {
  frame = 0
  const viewportHeight = window.innerHeight
  const scrollY = window.scrollY

  for (const item of visible) {
    // La traversée complète couvre la hauteur de l'élément plus celle de l'écran.
    const span = item.height + viewportHeight
    const raw = span === 0 ? 1 : (scrollY + viewportHeight - item.top) / span
    const p = raw < 0 ? 0 : raw > 1 ? 1 : raw
    item.el.style.setProperty("--p", p.toFixed(4))
    item.el.style.setProperty("--pc", (p * 2 - 1).toFixed(4))
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
    // Marge de sécurité pour que l'élément soit déjà positionné à son entrée.
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
        // Position de repos : l'effet est neutralisé, jamais figé à mi-course.
        el!.style.setProperty("--p", "1")
        el!.style.setProperty("--pc", "0")
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
