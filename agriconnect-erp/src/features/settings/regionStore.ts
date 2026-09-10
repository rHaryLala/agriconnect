import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type RegionCode = "MG" | "FR" | "GB"

export interface RegionDefinition {
  code: RegionCode
  locale: string
  timezone: string
  currency: string
  currencyLabel: string
  dateFormat: string
}

export const REGIONS: Record<RegionCode, RegionDefinition> = {
  MG: { code: "MG", locale: "fr-MG", timezone: "Africa/Antananarivo", currency: "MGA", currencyLabel: "Ariary (MGA)", dateFormat: "JJ/MM/AAAA" },
  FR: { code: "FR", locale: "fr-FR", timezone: "Europe/Paris", currency: "EUR", currencyLabel: "Euro (EUR)", dateFormat: "JJ/MM/AAAA" },
  GB: { code: "GB", locale: "en-GB", timezone: "Europe/London", currency: "GBP", currencyLabel: "Pound (GBP)", dateFormat: "DD/MM/YYYY" },
}

interface RegionState {
  region: RegionCode
  autoDetected: boolean
  setRegion: (region: RegionCode, autoDetected?: boolean) => void
}

export const useRegionStore = create<RegionState>()(
  persist(
    (set) => ({
      region: "MG",
      autoDetected: false,
      setRegion: (region, autoDetected = false) => set({ region, autoDetected }),
    }),
    { name: "agriconnect-region", storage: createJSONStorage(() => localStorage) }
  )
)

export function currentRegion(): RegionDefinition {
  return REGIONS[useRegionStore.getState().region] ?? REGIONS.MG
}

/**
 * Front-only detection: the browser's own timezone is enough to map a region,
 * with geolocation coordinates used as a fallback signal. No network call.
 */
export function detectRegionFromBrowser(): RegionCode | null {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const match = (Object.values(REGIONS) as RegionDefinition[]).find((r) => r.timezone === timezone)
  return match?.code ?? null
}

export function detectRegionFromCoords(latitude: number, longitude: number): RegionCode | null {
  if (latitude >= -25.7 && latitude <= -11.9 && longitude >= 43.1 && longitude <= 50.6) return "MG"
  if (latitude >= 41.3 && latitude <= 51.2 && longitude >= -5.2 && longitude <= 9.6) return "FR"
  if (latitude >= 49.8 && latitude <= 60.9 && longitude >= -8.7 && longitude <= 1.8) return "GB"
  return null
}
