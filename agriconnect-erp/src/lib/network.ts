interface NetworkInformationLike {
  saveData?: boolean
  effectiveType?: string
}

const SLOW_EFFECTIVE_TYPES = ["slow-2g", "2g"]
const REDUCED_DATA_QUERY = "(prefers-reduced-data: reduce)"

export function prefersReducedData(): boolean {
  if (typeof navigator === "undefined") return false

  if (typeof window !== "undefined" && window.matchMedia(REDUCED_DATA_QUERY).matches) return true

  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection
  if (!connection) return false

  return connection.saveData === true || SLOW_EFFECTIVE_TYPES.includes(connection.effectiveType ?? "")
}
