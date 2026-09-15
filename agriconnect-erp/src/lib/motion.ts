// Deux réglages coupent les animations : la préférence système et le réglage
// « Animations » de l'application, qui pose html.no-animations.
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"
const HOVER_QUERY = "(hover: hover) and (pointer: fine)"

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true
  return (
    window.matchMedia(REDUCED_MOTION_QUERY).matches ||
    document.documentElement.classList.contains("no-animations")
  )
}

// Les effets liés au pointeur n'ont aucun sens au doigt : ils resteraient
// figés sur la dernière position touchée.
export function supportsHover(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia(HOVER_QUERY).matches
}

// Les deux réglages peuvent changer en cours de session : la préférence
// système depuis l'OS, la classe depuis Paramètres → Apparence.
export function watchMotionPreference(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {}

  const media = window.matchMedia(REDUCED_MOTION_QUERY)
  media.addEventListener("change", onChange)

  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributeFilter: ["class"] })

  return () => {
    media.removeEventListener("change", onChange)
    observer.disconnect()
  }
}
