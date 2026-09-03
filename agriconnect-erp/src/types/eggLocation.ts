import type { EggCategory } from "./production"

export type EggLocation = "ferme" | "magasinier" | "store"
export const EGG_LOCATIONS: EggLocation[] = ["ferme", "magasinier", "store"]

export interface EggTransfer {
  id: string
  date: string
  from: EggLocation
  to: EggLocation
  quantities: Record<EggCategory, number>
  responsable: string
  observation?: string
}