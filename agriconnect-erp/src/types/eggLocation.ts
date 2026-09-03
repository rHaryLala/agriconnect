import type { EggCategory } from "./production"

export type EggLocation = "ferme" | "magasinier" | "store"
export const EGG_LOCATIONS: EggLocation[] = ["ferme", "magasinier", "store"]

export interface EggTransfer {
  id: string
  date: string
  from: EggLocation
  to: EggLocation | "externe"
  quantities: Record<EggCategory, number>
  responsable: string
  observation?: string
  invoiceId?: string
}
export const LOCATION_TO_CLIENT_ID: Partial<Record<EggLocation, string>> = {
  magasinier: "cl-magasinier",
  store: "cl-2",
}