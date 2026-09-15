import { useEffect, useState } from "react"
import { prefersReducedMotion, watchMotionPreference } from "@/lib/motion"

// Le balayage horizontal détourne le défilement vertical : il ne se justifie
// qu'avec de la largeur à parcourir et un pointeur fin. Au doigt, le geste entre
// en conflit avec le défilement naturel de la page et donne un écran qui semble
// bloqué — la grille verticale reste alors la bonne réponse.
const PIN_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)"

function pinAllowed(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia(PIN_QUERY).matches && !prefersReducedMotion()
}

/**
 * Dit si la section peut s'épingler pour balayer ses cartes horizontalement.
 *
 * Renvoie `false` sans JavaScript, sur petit écran, au doigt et en mouvement
 * réduit : la section retombe alors sur sa grille verticale, qui reste le
 * rendu par défaut du balisage.
 */
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
