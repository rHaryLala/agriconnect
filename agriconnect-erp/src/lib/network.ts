// L'API Network Information n'est pas dans les types du DOM : on ne déclare que
// les deux champs consultés, et leur absence vaut « réseau inconnu ».
interface NetworkInformationLike {
  saveData?: boolean
  effectiveType?: string
}

const SLOW_EFFECTIVE_TYPES = ["slow-2g", "2g"]
const REDUCED_DATA_QUERY = "(prefers-reduced-data: reduce)"

/**
 * Vrai quand le visiteur a demandé l'économie de données, ou quand le réseau est
 * trop lent pour un média décoratif. Les fonds vidéo de la vitrine s'en tiennent
 * alors à leur affiche : la ferme travaille souvent sur un forfait compté.
 *
 * Un navigateur qui ignore la requête média répond simplement `false`, et
 * `navigator.connection` manquant est traité comme un réseau correct — le doute
 * profite à l'affichage complet.
 */
export function prefersReducedData(): boolean {
  if (typeof navigator === "undefined") return false

  if (typeof window !== "undefined" && window.matchMedia(REDUCED_DATA_QUERY).matches) return true

  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection
  if (!connection) return false

  return connection.saveData === true || SLOW_EFFECTIVE_TYPES.includes(connection.effectiveType ?? "")
}
